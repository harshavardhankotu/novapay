import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cards = await prisma.savedCard.findMany({ where: { userId: p.userId } })
  return NextResponse.json(cards)
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { cardNumber, cardNetwork, lastFour, expiryMonth, expiryYear, cardholder, nickname } = await request.json()
  const card = await prisma.savedCard.create({
    data: { userId: p.userId, cardNumber, cardNetwork: cardNetwork || "VISA", lastFour, expiryMonth, expiryYear, cardholder, nickname },
  })
  return NextResponse.json(card)
}

export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, isDefault } = await request.json()
  if (isDefault) await prisma.savedCard.updateMany({ where: { userId: p.userId }, data: { isDefault: false } })
  await prisma.savedCard.updateMany({ where: { id, userId: p.userId }, data: { isDefault: isDefault || false } })
  return NextResponse.json({ success: true })
}
