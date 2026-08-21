import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const config = await prisma.roundupConfig.findUnique({ where: { userId: p.userId } })
  return NextResponse.json(config || { enabled: true, multiplier: 1, savedTotal: 0 })
}

export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { enabled, multiplier } = await request.json()
  const config = await prisma.roundupConfig.upsert({
    where: { userId: p.userId },
    create: { userId: p.userId, enabled: enabled ?? true, multiplier: multiplier ?? 1 },
    update: { enabled: enabled ?? undefined, multiplier: multiplier ?? undefined },
  })
  return NextResponse.json(config)
}
