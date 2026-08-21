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
  const redemption = await prisma.rewardRedemption.create({
    data: { userId: p.userId, rewardId: `cat_${Date.now()}`, title, pointsCost },
  })
  return NextResponse.json(redemption)
}
