import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const billers = await prisma.biller.findMany({ where: { userId: p.userId }, include: { billPayments: { orderBy: { paidAt: "desc" }, take: 5 } } })
  return NextResponse.json(billers)
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { category, name, consumerNo, nickname, autoPay } = await request.json()
  const biller = await prisma.biller.create({
    data: { userId: p.userId, category, name, consumerNo, nickname, autoPay: autoPay || false },
  })
  return NextResponse.json(biller)
}

export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, autoPay, autoPayLimit } = await request.json()
  await prisma.biller.updateMany({ where: { id, userId: p.userId }, data: { autoPay, autoPayLimit } })
  return NextResponse.json({ success: true })
}
