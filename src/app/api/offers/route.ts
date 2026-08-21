import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const offers = await prisma.offer.findMany({ where: { OR: [{ userId: p.userId }, { userId: null }] }, orderBy: { createdAt: "desc" } })
  return NextResponse.json(offers)
}

export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await request.json()
  await prisma.offer.updateMany({ where: { id, userId: p.userId }, data: { status: "REDEEMED" } })
  return NextResponse.json({ success: true })
}
