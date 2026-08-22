import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function requireAdmin(request: Request) {
  const token = getTokenFromCookies(request)
  const payload = token ? verifyToken(token) : null
  if (!payload || payload.role !== "ADMIN") return null
  return payload
}

/** GET — recent flags with reasons (admin radar view). */
export async function GET(request: Request) {
  const admin = await requireAdmin(request)
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const flags = await prisma.fraudFlag.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { user: { select: { name: true, email: true } } },
  })
  return NextResponse.json(flags)
}

/**
 * POST — admin-only sandbox: inject a synthetic suspicious transaction into a
 * target account's real ledger (clearly labeled as a simulation exercise),
 * then run the fraud rules live and return every flag with its reason.
 * { targetEmail, amount?, recipientAccountNumber? }
 */
export async function POST(request: Request) {
  const admin = await requireAdmin(request)
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const body = await request.json()
    const email = String(body.targetEmail || "test@novapay.in").toLowerCase()
    const user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: { where: { isActive: true }, take: 1 } },
    })
    if (!user || !user.accounts[0]) {
      return NextResponse.json({ error: "Target account not found" }, { status: 404 })
    }
    const account = user.accounts[0]
    const amount = Number.isFinite(Number(body.amount)) ? Number(body.amount) : 950_000
    const recipient = String(body.recipientAccountNumber || `NOVASANDBOX${Date.now().toString().slice(-6)}`)
    const reference = `FRS${Date.now()}`

    // Synthetic ledger entry — labeled so it is never confused with real activity.
    const txn = await prisma.$transaction(async (tx) => {
      await tx.account.update({ where: { id: account.id }, data: { balance: { decrement: amount } } })
      return tx.transaction.create({
        data: {
          accountId: account.id,
          type: "DEBIT",
          amount: -amount,
          currency: "INR",
          status: "COMPLETED",
          category: "Transfer",
          description: `[SANDBOX INJECTION by ${admin.name}] synthetic high-value transfer`,
          reference,
          counterparty: recipient,
        },
      })
    })

    // ── Live rule evaluation against this account's real history ──
    const since60 = new Date(Date.now() - 60 * 86400000)
    const recentTxns = await prisma.transaction.findMany({
      where: { accountId: account.id, type: "DEBIT", timestamp: { gte: new Date(Date.now() - 15 * 60000) } },
      select: { timestamp: true },
    })

    const histRows = await prisma.transaction.findMany({
      where: { accountId: account.id, type: "DEBIT", status: "COMPLETED", timestamp: { gte: since60 } },
      select: { amount: true },
    })
    const histAmounts = histRows.map((r) => Math.abs(r.amount)).filter((v) => v > 1)

    const firstToRecipient = await prisma.transaction.findFirst({
      where: { accountId: account.id, counterparty: recipient, timestamp: { lt: new Date(Date.now() - 60000) } },
      select: { timestamp: true },
    })

    const { runFraudRules } = await import("@/lib/fraud")
    const flags = runFraudRules({
      txnTimestamps: recentTxns.map((t) => t.timestamp),
      amount,
      historicalAmounts: histAmounts,
      recipientFirstSeenAt: firstToRecipient?.timestamp ?? null,
      knownDeviceIds: [],
      currentDeviceId: null,
    })

    // Persist + wire HIGH severity flags into STR case lifecycle
    for (const f of flags) {
      let strCaseId: string | null = null
      if (f.severity === "HIGH") {
        const sc = await prisma.strCase.create({
          data: {
            subjectUserId: user.id,
            triggerRef: reference,
            rule: f.rule,
            summary: f.reason,
            status: "OPEN",
            assignedTo: admin.name,
          },
        })
        strCaseId = sc.id
      }
      await prisma.fraudFlag.create({
        data: {
          userId: user.id,
          txnRef: reference,
          rail: "SANDBOX",
          amount,
          rule: f.rule,
          reason: f.reason,
          severity: f.severity,
          strCaseId,
        },
      })
    }

    return NextResponse.json({
      injected: { reference, amount, recipient },
      flagsTriggered: flags.length,
      flags,
    })
  } catch (e) {
    console.error("fraud sandbox failed:", e)
    return NextResponse.json({ error: "Sandbox injection failed" }, { status: 500 })
  }
}