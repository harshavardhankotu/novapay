import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notify, audit } from "@/lib/banking"

/**
 * Dispute state machine:
 *   RAISED → UNDER_REVIEW → PROVISIONAL_CREDIT → RESOLVED | REVERSED
 * User can raise. Admin (role=ADMIN) drives transitions past RAISED.
 * Entering PROVISIONAL_CREDIT credits the disputed amount to the user's
 * primary account as a real ledger movement.
 */

const TRANSITIONS: Record<string, string[]> = {
  RAISED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["PROVISIONAL_CREDIT", "RESOLVED"],
  PROVISIONAL_CREDIT: ["RESOLVED", "REVERSED"],
}

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const disputes = await prisma.disputeTicket.findMany({
    where: p.role === "ADMIN" ? {} : { userId: p.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  return NextResponse.json(disputes.map(d => ({ ...d, allowedTransitions: TRANSITIONS[d.status] ?? [] })))
}

/** POST — raise a dispute against a transaction. */
export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json()
    const txnId = String(body.txnId || "")
    const reason = typeof body.reason === "string" && body.reason.trim() ? body.reason.trim().slice(0, 300) : ""
    if (!txnId || !reason) return NextResponse.json({ error: "txnId and reason required" }, { status: 400 })

    const txn = await prisma.transaction.findFirst({
      where: { id: txnId, account: { userId: p.userId } },
    })
    if (!txn) return NextResponse.json({ error: "Transaction not found in your accounts" }, { status: 404 })
    if (txn.type !== "DEBIT") return NextResponse.json({ error: "Only debit transactions can be disputed" }, { status: 400 })

    const dispute = await prisma.disputeTicket.create({
      data: {
        userId: p.userId,
        merchant: txn.counterparty || txn.description?.slice(0, 40) || "Unknown merchant",
        amount: Math.abs(txn.amount),
        reason,
        txnRef: txn.reference,
        status: "RAISED",
        npciRef: `DSP${Date.now()}${Math.floor(Math.random() * 1000)}`,
      },
    })
    await audit(p.userId, "DISPUTE_RAISED", `${dispute.npciRef} on ${txn.reference}`)
    void notify
    return NextResponse.json(dispute)
  } catch {
    return NextResponse.json({ error: "Could not raise dispute" }, { status: 500 })
  }
}

/** PATCH — drive the state machine (admin) / withdraw (owner while RAISED). */
export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const id = String(body.id)
    const action = String(body.action)

    const dispute = await prisma.disputeTicket.findUnique({ where: { id } })
    if (!dispute) return NextResponse.json({ error: "Dispute not found" }, { status: 404 })

    // Owner withdrawal only while RAISED
    if (action === "withdraw") {
      const r = await prisma.disputeTicket.updateMany({
        where: { id, userId: p.userId, status: "RAISED" },
        data: { status: "WITHDRAWN" },
      })
      if (r.count === 0) return NextResponse.json({ error: "Cannot withdraw at this stage" }, { status: 400 })
      return NextResponse.json({ ok: true, status: "WITHDRAWN" })
    }

    if (p.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const legal = TRANSITIONS[dispute.status] ?? []
    let nextStatus: string

    switch (action) {
      case "review":
        nextStatus = "UNDER_REVIEW"; break
      case "provisional_credit":
        nextStatus = "PROVISIONAL_CREDIT"; break
      case "resolve":
        nextStatus = "RESOLVED"; break
      case "reverse": {
        if (!legal.includes("REVERSED")) {
          return NextResponse.json({ error: `Illegal transition from ${dispute.status}` }, { status: 400 })
        }
        nextStatus = "REVERSED"
        // REVERSED after provisional credit → claw the money back
        await applyProvisionalMovement(dispute.userId, -dispute.amount, `Dispute reversed · ${dispute.npciRef}`)
        break
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }

    if (!legal.includes(nextStatus)) {
      return NextResponse.json(
        { error: `Illegal transition: ${dispute.status} → ${nextStatus}. Legal: ${legal.join(", ")}` },
        { status: 400 }
      )
    }

    if (nextStatus === "PROVISIONAL_CREDIT") {
      await applyProvisionalMovement(dispute.userId, dispute.amount, `Provisional credit · dispute ${dispute.npciRef}`)
    }

    const updated = await prisma.disputeTicket.update({
      where: { id },
      data: { status: nextStatus },
    })
    await notify(dispute.userId, `Dispute ${nextStatus.replace("_", " ")}`, `Your dispute of ₹${dispute.amount.toLocaleString("en-IN")} is now ${nextStatus.replace(/_/g, " ").toLowerCase()}.`)
    await audit(p.role === "ADMIN" ? dispute.userId : p.userId, "DISPUTE_TRANSITION", `${dispute.npciRef}: ${dispute.status} → ${nextStatus} by admin`)
    return NextResponse.json(updated)
  } catch (e) {
    console.error("dispute transition failed:", e)
    return NextResponse.json({ error: "Transition failed" }, { status: 500 })
  }
}

async function applyProvisionalMovement(userId: string, amount: number, description: string): Promise<void> {
  const account = await prisma.account.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: "asc" },
  })
  if (!account) return
  await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: account.id },
      data: { balance: { increment: Math.round(amount * 100) / 100 } },
    })
    await tx.transaction.create({
      data: {
        accountId: account.id,
        type: amount >= 0 ? "CREDIT" : "DEBIT",
        amount: Math.round(Math.abs(amount) * 100) / 100,
        currency: "INR",
        status: "COMPLETED",
        category: "Other",
        description,
        reference: `PC${Date.now()}`,
        counterparty: "NovaPay Disputes",
      },
    })
  })
}