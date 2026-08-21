import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { title, pointsCost } = await request.json()
  if (!title || !pointsCost || typeof pointsCost !== "number" || pointsCost <= 0) {
    return NextResponse.json({ error: "Invalid redemption details" }, { status: 400 })
  }
  const reward = await prisma.reward.findUnique({ where: { userId: p.userId } })
  if (!reward || reward.points < pointsCost) return NextResponse.json({ error: "Insufficient points" }, { status: 400 })
  await prisma.reward.update({ where: { userId: p.userId }, data: { points: { decrement: pointsCost } } })

  // Cashback lands as REAL money in the primary account (₹0.40 per point)
  const cashback = Math.round(pointsCost * 0.4 * 100) / 100
  let credited = false
  try {
    const account = await prisma.account.findFirst({
      where: { userId: p.userId, isActive: true },
      orderBy: { createdAt: "asc" },
    })
    if (account && cashback > 0) {
      const reference = `CSH${Date.now()}`
      await prisma.$transaction(async (tx) => {
        await tx.account.update({ where: { id: account.id }, data: { balance: { increment: cashback } } })
        await tx.transaction.create({
          data: {
            accountId: account.id,
            type: "CREDIT",
            amount: cashback,
            currency: "INR",
            status: "COMPLETED",
            category: "Reward",
            description: `NovaPoints redemption · ${pointsCost.toLocaleString()} pts`,
            reference,
            counterparty: "NovaPay Rewards",
          },
        })
      })
      credited = true
    }
  } catch {
    // credit failure shouldn't block redemption record
  }

  const redemption = await prisma.rewardRedemption.create({
    data: { userId: p.userId, rewardId: `cat_${Date.now()}`, title, pointsCost },
  })
  return NextResponse.json({ ...redemption, cashbackCredited: credited ? cashback : 0 })
}
