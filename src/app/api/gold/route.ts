import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const gold = await prisma.digitalGold.findUnique({ where: { userId: p.userId } })
  return NextResponse.json(gold || { grams: 0 })
}

export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { grams } = await request.json()
  const gold = await prisma.digitalGold.upsert({
    where: { userId: p.userId },
    create: { userId: p.userId, grams },
    update: { grams },
  })
  return NextResponse.json(gold)
}
