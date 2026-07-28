import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const accounts = await prisma.account.findMany({
    where: { userId: payload.userId },
    include: { cards: true, transactions: { take: 5, orderBy: { timestamp: "desc" } } },
  })

  return NextResponse.json(accounts)
}

export async function POST(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const { type, currency } = await request.json()

  const account = await prisma.account.create({
    data: {
      userId: payload.userId,
      type: type || "SAVINGS",
      currency: currency || "INR",
      accountNumber: `REV${currency || "INR"}${Date.now().toString().slice(-8)}`,
      ifsc: "REVU0000001",
      upiHandle: `${payload.email.split("@")[0]}${(currency || "INR").toLowerCase()}@revolut`,
    },
  })

  return NextResponse.json(account)
}
