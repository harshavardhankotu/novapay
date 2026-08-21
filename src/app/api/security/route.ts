import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const logs = await prisma.auditLog.findMany({
    where: { userId: p.userId },
    orderBy: { timestamp: "desc" },
    take: 50,
  })
  return NextResponse.json({ logs, deviceId: "iPhone16Pro_SIM_899104", ipAddress: "103.22.180.45 (Mumbai, IN)" })
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { action, details } = await request.json()
  const log = await prisma.auditLog.create({
    data: { userId: p.userId, action, details, ip: request.headers.get("x-forwarded-for") || "local", device: "web" },
  })
  return NextResponse.json(log)
}
