import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const funds = await prisma.mutualFundInvestment.findMany({ where: { userId: p.userId } })
  return NextResponse.json(funds)
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { fundName, fundCategory, sipAmount, lumpsumAmount, nav } = await request.json()
  const investAmount = lumpsumAmount || sipAmount || 0; const units = investAmount / (nav || 100)
  const fund = await prisma.mutualFundInvestment.create({
    data: { userId: p.userId, fundName, fundCategory, sipAmount, lumpsumAmount, units, nav: nav || 100, investedAmount: investAmount, currentValue: investAmount },
  })
  return NextResponse.json(fund)
}
