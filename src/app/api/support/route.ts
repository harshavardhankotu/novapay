import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const tickets = await prisma.supportTicket.findMany({ where: { userId: p.userId }, include: { messages: { orderBy: { createdAt: "desc" } } }, orderBy: { createdAt: "desc" } })
  return NextResponse.json(tickets)
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { subject, category, message } = await request.json()
  const ticket = await prisma.supportTicket.create({
    data: { userId: p.userId, subject, category: category || "GENERAL", messages: { create: { senderId: p.userId, message } } },
  })
  return NextResponse.json(ticket)
}
