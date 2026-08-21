import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const pockets = await prisma.smartPocket.findMany({ where: { userId: p.userId } })
  const roundup = await prisma.roundupConfig.findUnique({ where: { userId: p.userId } })
  return NextResponse.json({ pockets, roundup })
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { name, target, category, color } = await request.json()
  const pocket = await prisma.smartPocket.create({
    data: { userId: p.userId, name, target, category: category || "savings", color: color || "#2dd4bf" },
  })
  return NextResponse.json(pocket)
}

export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, current } = await request.json()
  await prisma.smartPocket.updateMany({ where: { id, userId: p.userId }, data: { current } })
  return NextResponse.json({ success: true })
}
