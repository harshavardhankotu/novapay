import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const accounts = await prisma.externalAccount.findMany({ where: { userId: p.userId } })
  return NextResponse.json(accounts)
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { bank, accountNo, balance } = await request.json()
  const acc = await prisma.externalAccount.create({
    data: { userId: p.userId, bank, accountNo, balance: balance || 0 },
  })
  return NextResponse.json(acc)
}

export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, balance } = await request.json()
  const acc = await prisma.externalAccount.updateMany({ where: { id, userId: p.userId }, data: { balance } })
  return NextResponse.json({ success: true })
}
