import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const devices = await prisma.trustedDevice.findMany({ where: { userId: p.userId } })
  return NextResponse.json(devices)
}

export async function DELETE(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await request.json()
  await prisma.trustedDevice.deleteMany({ where: { id, userId: p.userId } })
  return NextResponse.json({ success: true })
}
