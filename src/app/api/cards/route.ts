import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const cards = await prisma.card.findMany({
    where: { account: { userId: payload.userId } },
    include: { account: { select: { currency: true } } },
  })

  return NextResponse.json(cards.map((c) => ({ ...c, cvv: "***" })))
}

export async function POST(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const { type, network } = await request.json()
  const account = await prisma.account.findFirst({ where: { userId: payload.userId } })
  if (!account) return NextResponse.json({ error: "No account found" }, { status: 400 })

  const card = await prisma.card.create({
    data: {
      accountId: account.id,
      type: type || "VIRTUAL",
      network: network || "VISA",
      lastFour: Math.floor(1000 + Math.random() * 9000).toString(),
      expiryMonth: new Date().getMonth() + 1,
      expiryYear: new Date().getFullYear() + 3,
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      dailyLimit: 100000,
      monthlyLimit: 500000,
    },
  })

  return NextResponse.json({ ...card, cvv: "***" })
}

export async function PATCH(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const { id, action, dailyLimit, monthlyLimit } = await request.json()

  const card = await prisma.card.findFirst({
    where: { id, account: { userId: payload.userId } },
  })
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 })

  const update: any = {}
  if (action === "freeze") update.status = "FROZEN"
  if (action === "unfreeze") update.status = "ACTIVE"
  if (dailyLimit) update.dailyLimit = dailyLimit
  if (monthlyLimit) update.monthlyLimit = monthlyLimit

  const updated = await prisma.card.update({ where: { id }, data: update })
  return NextResponse.json({ ...updated, cvv: "***" })
}
