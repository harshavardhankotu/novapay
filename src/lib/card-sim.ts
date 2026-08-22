import { prisma } from "@/lib/prisma"

/**
 * ── POS/ATM swipe simulation (P5) ────────────────────────────────────────────
 * Real decline-reason matrix, evaluated in the order a real switch would:
 * status → per-tx limit → MCC block → intl toggle → daily limit → funds.
 */

export const MCC_CATEGORIES = [
  "GROCERY", "FUEL", "RESTAURANT", "TRAVEL", "ELECTRONICS",
  "ATM_CASH", "GAMBLING", "CRYPTO", "UTILITIES", "OTHER",
] as const

export interface SwipeInput {
  cardId: string
  channel: "POS" | "ATM" | "ONLINE"
  mccCategory: string
  amount: number
  intl: boolean
}

export interface SwipeResult {
  result: "APPROVED" | "DECLINED"
  reason?: string
}

const round2 = (x: number) => Math.round(x * 100) / 100

export async function processSwipe(userId: string, input: SwipeInput): Promise<SwipeResult> {
  const card = await prisma.card.findFirst({
    where: { id: input.cardId, account: { userId } },
    include: { account: true },
  })
  if (!card) return { result: "DECLINED", reason: "CARD_NOT_FOUND" }

  let reason: string | undefined

  if (card.status === "FROZEN") reason = "FROZEN"
  else if (card.status === "CLOSED") reason = "CLOSED"
  else if (input.intl && !card.internationalEnabled) reason = "INTERNATIONAL_DISABLED"
  else if (input.mccCategory === "ATM_CASH" && card.type === "VIRTUAL") reason = "ATM_NOT_ALLOWED_ON_VIRTUAL"
  else {
    const blocked = (card.blockedMccCategories || "").split(",").map((c) => c.trim().toUpperCase()).filter(Boolean)
    if (blocked.includes(input.mccCategory.toUpperCase())) reason = `MCC_BLOCKED_${input.mccCategory.toUpperCase()}`
  }

  if (!reason && input.amount > (card.perTxLimit ?? Number.POSITIVE_INFINITY)) {
    reason = "PER_TX_LIMIT_EXCEEDED"
  }

  // Daily limit = today's approved swipes + this one
  if (!reason) {
    const midnight = new Date(); midnight.setHours(0, 0, 0, 0)
    const todays = await prisma.swipeAttempt.aggregate({
      where: { cardId: card.id, result: "APPROVED", createdAt: { gte: midnight } },
      _sum: { amount: true },
    })
    if ((todays._sum.amount ?? 0) + input.amount > card.dailyLimit) {
      reason = "DAILY_LIMIT_EXCEEDED"
    }
  }

  if (!reason && card.account.balance < input.amount) {
    reason = "INSUFFICIENT_BALANCE"
  }

  const result: SwipeResult = reason ? { result: "DECLINED", reason } : { result: "APPROVED" }

  await prisma.$transaction(async (tx) => {
    await tx.swipeAttempt.create({
      data: {
        userId,
        cardId: card.id,
        accountId: card.accountId,
        channel: input.channel,
        mccCategory: input.mccCategory,
        amount: input.amount,
        intl: input.intl,
        result: result.result,
        reason: result.reason,
      },
    })
    if (result.result === "APPROVED") {
      await tx.account.update({
        where: { id: card.accountId },
        data: { balance: { decrement: input.amount } },
      })
      await tx.transaction.create({
        data: {
          accountId: card.accountId,
          type: "DEBIT",
          amount: -round2(input.amount),
          currency: "INR",
          status: "COMPLETED",
          category: input.channel === "ATM" ? "Transfer" : "Shopping",
          description: `${input.channel} ${input.intl ? "(intl) " : ""}${input.mccCategory} · card ····${card.lastFour}`,
          reference: `SWIPE${Date.now()}`,
          counterparty: input.mccCategory,
        },
      })
    }
  })

  return result
}