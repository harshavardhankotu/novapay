import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const mandates = await prisma.paymentMandate.findMany({ where: { userId: p.userId }, orderBy: { nextRun: "asc" } })
  return NextResponse.json(mandates)
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { name, amount, frequency, accountId, nextRun } = await request.json()
  const mandate = await prisma.paymentMandate.create({
    data: { userId: p.userId, name, amount: amount || 0, frequency: frequency || "MONTHLY", accountId, nextRun: new Date(nextRun || Date.now() + 30 * 86400000), umrn: `UMRN${Date.now()}` },
  })
  return NextResponse.json(mandate)
}

export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, status } = await request.json()
  await prisma.paymentMandate.updateMany({ where: { id, userId: p.userId }, data: { status: status || "PAUSED" } })
  return NextResponse.json({ success: true })
}
