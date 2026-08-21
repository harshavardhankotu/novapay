import { prisma } from "@/lib/prisma"

// ─── Limits (RBI-style tiering) ──────────────────────────────────────────────

export const LIMITS: Record<string, { perTx: number; daily: number }> = {
  UNVERIFIED: { perTx: 0, daily: 0 },
  MINIMAL: { perTx: 10_000, daily: 25_000 },
  FULL: { perTx: 100_000, daily: 200_000 },
}

export class LimitError extends Error {
  constructor(public code: "KYC_REQUIRED" | "PER_TX" | "DAILY", message: string) { super(message) }
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Enforces KYC-tier per-transaction and cumulative daily debit limits.
 * Pass accountId to scope the daily sum to one account, or null/"*" to
 * aggregate across every account the user owns.
 * Throws LimitError when exceeded.
 */
export async function assertDebitAllowed(userId: string, accountId: string | null | "*", amount: number): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { kycLevel: true } })
  const tier = LIMITS[user?.kycLevel ?? "UNVERIFIED"]

  if (tier.perTx === 0) {
    throw new LimitError("KYC_REQUIRED", "Complete your KYC to send money")
  }
  if (amount > tier.perTx) {
    throw new LimitError("PER_TX", `Per-transaction limit is ₹${tier.perTx.toLocaleString("en-IN")} for your KYC level`)
  }

  const midnight = startOfToday()
  const todaysDebits = await prisma.transaction.aggregate({
    where: {
      type: "DEBIT",
      status: "COMPLETED",
      timestamp: { gte: midnight },
      ...(accountId && accountId !== "*" ? { accountId } : { account: { userId } }),
    },
    _sum: { amount: true },
  })
  // Stored debits are signed negative; sum of magnitudes:
  const spentToday = Math.abs(todaysDebits._sum.amount || 0)
  if (spentToday + amount > tier.daily) {
    throw new LimitError("DAILY", `Daily limit of ₹${tier.daily.toLocaleString("en-IN")} would be exceeded (used ₹${spentToday.toLocaleString("en-IN")})`)
  }
}

// ─── NovaPoints earning ──────────────────────────────────────────────────────

/** 1 point per ₹100 spent on debits. */
export async function awardSpendPoints(userId: string, spendAmount: number): Promise<number> {
  const pts = Math.floor(spendAmount / 100)
  if (pts <= 0) return 0
  try {
    await prisma.reward.update({ where: { userId }, data: { points: { increment: pts } } })
    return pts
  } catch {
    return 0 // no rewards row yet — non-fatal
  }
}

// ─── Event notifications ─────────────────────────────────────────────────────

export async function notify(userId: string, title: string, body: string, type = "transaction"): Promise<void> {
  try {
    await prisma.notification.create({
      data: { userId, title, body, type, channel: "PUSH", read: false },
    })
  } catch {
    // notifications must never break money movement
  }
}

// ─── Audit trail ─────────────────────────────────────────────────────────────

export async function audit(
  userId: string | null | undefined,
  action: string,
  details: string,
  device?: string
): Promise<void> {
  if (!userId) return
  try {
    await prisma.auditLog.create({
      data: { userId, action, details, device: device || "NovaPay Web", ip: "client" },
    })
  } catch {
    // audit failures must never break money movement
  }
}
