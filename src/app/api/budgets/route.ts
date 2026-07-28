import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const currentMonth = new Date().toISOString().slice(0, 7)
  const budgets = await prisma.budget.findMany({
    where: { userId: payload.userId, month: currentMonth },
  })

  return NextResponse.json(budgets)
}

export async function POST(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const { category, amount, period } = await request.json()

  const budget = await prisma.budget.create({
    data: {
      userId: payload.userId,
      category,
      amount,
      period: period || "MONTHLY",
      month: new Date().toISOString().slice(0, 7),
    },
  })

  return NextResponse.json(budget)
}
