import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const fds = await prisma.fixedDeposit.findMany({ where: { userId: p.userId }, orderBy: { createdAt: "desc" } })
  return NextResponse.json(fds)
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { amount, tenureMonths, interestRate, fdType, accountId, nominee, autoRenew } = await request.json()
  const rate = interestRate || 7.5; const months = tenureMonths || 12
  const maturityAmount = amount * Math.pow(1 + (rate / 100) / 4, 4 * months / 12)
  const maturityDate = new Date(Date.now() + months * 30 * 86400000)
  const fd = await prisma.fixedDeposit.create({
    data: { userId: p.userId, accountId, amount, interestRate: rate, tenureMonths: months, maturityDate, maturityAmount: Math.round(maturityAmount), nominee, autoRenew: autoRenew || false, fdType: fdType || "CUMULATIVE" },
  })
  return NextResponse.json(fd)
}
