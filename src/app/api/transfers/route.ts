import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { assertDebitAllowed, awardSpendPoints, notify, audit, LimitError, applyRoundup, updateBudgetSpent } from "@/lib/banking"
import { validateRail, assertRailAllows, resolveRailSchedule, RailError } from "@/lib/rails"

class ApiError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

function toValidAmount(raw: unknown): number {
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    throw new ApiError(400, "Invalid amount")
  }
  const rounded = Math.round(raw * 100) / 100
  if (rounded <= 0) throw new ApiError(400, "Amount must be greater than zero")
  return rounded
}

export async function POST(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  try {
    const body = await request.json()
    const { fromAccountId, toAccountNumber, note } = body
    const amount = toValidAmount(body.amount)

    // Idempotency: same dedupeKey never moves money twice.
    if (typeof body.dedupeKey === "string" && body.dedupeKey) {
      const existing = await prisma.transaction.findUnique({ where: { dedupeKey: body.dedupeKey } })
      if (existing) {
        return NextResponse.json({ transfer: existing, reference: existing.reference, duplicate: true })
      }
    }

    await assertDebitAllowed(payload.userId, fromAccountId, amount)

    // Rail differentiation: each rail carries its own operating rules
    const rail = validateRail(body.rail)
    assertRailAllows(rail, amount)
    const { mode, scheduledFor } = resolveRailSchedule(rail, amount)
    const txnStatus = scheduledFor ? "PENDING" : "COMPLETED"

    const reference = `TXN${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    // Ledger convention: debits are stored SIGNED negative.
    const signedAmount = -amount

    const transfer = await prisma.$transaction(async (tx) => {
      const fromAccount = await tx.account.findFirst({
        where: { id: fromAccountId, userId: payload.userId },
      })
      if (!fromAccount) throw new ApiError(404, "Account not found")
      if (fromAccount.balance < amount) throw new ApiError(400, "Insufficient balance")

      await tx.account.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: amount } },
      })

      let creditedTo: string | null = null
      if (toAccountNumber) {
        const toAccount = await tx.account.findUnique({ where: { accountNumber: toAccountNumber } })
        if (toAccount && toAccount.id !== fromAccountId) {
          await tx.account.update({
            where: { id: toAccount.id },
            data: { balance: { increment: amount } },
          })
          creditedTo = toAccount.userId

          await tx.transaction.create({
            data: {
              accountId: toAccount.id,
              type: "CREDIT",
              amount, // credits stay positive
              currency: toAccount.currency,
              status: "COMPLETED",
              category: "Transfer",
              description: note || `Transfer from ${fromAccount.accountNumber}`,
              reference: `${reference}C`,
              counterparty: payload.name || "NovaPay user",
            },
          })
        }
      }

      const created = await tx.transaction.create({
        data: {
          accountId: fromAccountId,
          type: "DEBIT",
          amount: signedAmount,
          currency: fromAccount.currency,
          status: txnStatus,
          category: "Transfer",
          description: note || `Transfer to ${toAccountNumber || "external"}`,
          reference,
          counterparty: toAccountNumber || "External Account",
          ...(scheduledFor ? { scheduledFor } : {}),
          ...(typeof body.dedupeKey === "string" && body.dedupeKey ? { dedupeKey: body.dedupeKey } : {}),
        },
      })
      // Interlocked PFM loop — round-up sweep inside the SAME transaction:
      await applyRoundup(tx as any, payload.userId, amount)
      return created
    }, { maxWait: 5000, timeout: 10000 })

    // ── Post-transaction side effects (never block the money movement) ──
    const points = await awardSpendPoints(payload.userId, amount)
    await updateBudgetSpent(payload.userId, "Transfer", amount)
    await notify(
      payload.userId,
      scheduledFor ? "Transfer Scheduled" : "Money Sent",
      scheduledFor
        ? `₹${amount.toLocaleString("en-IN")} via ${rail} queued for ${scheduledFor.toLocaleString("en-IN")} (batch window).`
        : `₹${amount.toLocaleString("en-IN")} sent via ${rail} to ${toAccountNumber || "external account"}${points ? ` · +${points} NovaPoints` : ""}`
    )
    await audit(payload.userId, "TRANSFER_INITIATED", `${rail} ${toAccountNumber ? "transfer" : "payout"} of ₹${amount} (${reference})${scheduledFor ? " [scheduled]" : ""}`)

    return NextResponse.json({ transfer, reference, rail, pointsEarned: points, scheduled: !!scheduledFor, scheduledFor })
  } catch (error) {
    if (error instanceof LimitError) {
      const status = error.code === "KYC_REQUIRED" ? 403 : 400
      return NextResponse.json({ error: error.message, code: error.code }, { status })
    }
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (error instanceof RailError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 })
    }
    return NextResponse.json({ error: "Transfer failed" }, { status: 500 })
  }
}