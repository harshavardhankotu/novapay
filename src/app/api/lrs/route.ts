import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const txns = await prisma.lRSTransaction.findMany({ where: { userId: p.userId }, orderBy: { createdAt: "desc" } })
  const totalUsed = txns.reduce((s, t) => s + t.amountUsd, 0)
  return NextResponse.json({ transactions: txns, annualLimitUsd: 250000, usedLimitUsd: totalUsed })
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { amountUsd, amountInr, tcsAmount, purpose, beneficiaryName } = await request.json()
  const tx = await prisma.lRSTransaction.create({
    data: { userId: p.userId, amountUsd, amountInr, tcsAmount: tcsAmount || 0, purpose, beneficiaryName },
  })
  return NextResponse.json(tx)
}
