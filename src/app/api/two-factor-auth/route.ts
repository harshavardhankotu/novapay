import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  let tfa = await prisma.twoFactorAuth.findUnique({ where: { userId: p.userId } })
  if (!tfa) {
    tfa = await prisma.twoFactorAuth.create({
      data: { userId: p.userId, secret: `TOTP${Math.random().toString(36).slice(2, 10)}`, method: "TOTP", enabled: false },
    })
  }
  return NextResponse.json(tfa)
}

export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { enabled } = await request.json()
  const tfa = await prisma.twoFactorAuth.upsert({
    where: { userId: p.userId },
    create: { userId: p.userId, secret: `TOTP${Math.random().toString(36).slice(2, 10)}`, enabled },
    update: { enabled },
  })
  return NextResponse.json(tfa)
}
