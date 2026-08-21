import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const rds = await prisma.recurringDeposit.findMany({ where: { userId: p.userId }, orderBy: { createdAt: "desc" } })
  return NextResponse.json(rds)
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { monthlyAmount, tenureMonths, accountId, nominee } = await request.json()
  const maturityDate = new Date(Date.now() + (tenureMonths || 24) * 30 * 86400000)
  const rd = await prisma.recurringDeposit.create({
    data: { userId: p.userId, accountId, monthlyAmount, interestRate: 8.0, tenureMonths: tenureMonths || 24, maturityDate, totalDeposited: 0, nominee },
  })
  return NextResponse.json(rd)
}
