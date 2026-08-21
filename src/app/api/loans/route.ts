import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const loans = await prisma.loan.findMany({ where: { userId: p.userId }, orderBy: { createdAt: "desc" } })
  return NextResponse.json(loans)
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { type, principal, interestRate, tenureMonths, accountId } = await request.json()
  const rate = interestRate || 10.99; const months = tenureMonths || 24
  const monthlyRate = rate / 100 / 12
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1)
  const dueDate = new Date(Date.now() + 30 * 86400000)
  const loan = await prisma.loan.create({
    data: { userId: p.userId, accountId, type: type || "PERSONAL", principal, interestRate: rate, tenureMonths: months, emiAmount: Math.round(emi), outstanding: principal, dueDate, status: "ACTIVE" },
  })
  return NextResponse.json(loan)
}
