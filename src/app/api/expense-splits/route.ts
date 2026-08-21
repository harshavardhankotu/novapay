import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const splits = await prisma.expenseSplit.findMany({ where: { userId: p.userId }, orderBy: { createdAt: "desc" } })
  return NextResponse.json(splits)
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { title, totalAmount, splitWith, dueDate } = await request.json()
  const split = await prisma.expenseSplit.create({
    data: { userId: p.userId, title, totalAmount, splitWith, dueDate: new Date(dueDate || Date.now() + 7 * 86400000) },
  })
  return NextResponse.json(split)
}

export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await request.json()
  await prisma.expenseSplit.updateMany({ where: { id, userId: p.userId }, data: { settled: true } })
  return NextResponse.json({ success: true })
}
