import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const notifications = await prisma.notification.findMany({ where: { userId: p.userId }, orderBy: { createdAt: "desc" }, take: 50 })
  const unread = await prisma.notification.count({ where: { userId: p.userId, read: false } })
  return NextResponse.json({ notifications, unread })
}

export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, readAll } = await request.json()
  if (readAll) await prisma.notification.updateMany({ where: { userId: p.userId, read: false }, data: { read: true } })
  else await prisma.notification.updateMany({ where: { id, userId: p.userId }, data: { read: true } })
  return NextResponse.json({ success: true })
}
