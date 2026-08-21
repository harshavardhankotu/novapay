import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const ids = await prisma.upiId.findMany({ where: { userId: p.userId }, include: { account: { select: { accountNumber: true, ifsc: true } } } })
  return NextResponse.json(ids)
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { upiId, accountId, isPrimary } = await request.json()
  if (!upiId || typeof upiId !== "string" || !upiId.includes("@")) {
    return NextResponse.json({ error: "Valid UPI ID required" }, { status: 400 })
  }
  if (accountId) {
    const account = await prisma.account.findFirst({ where: { id: accountId, userId: p.userId } })
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 })
  }
  if (isPrimary) await prisma.upiId.updateMany({ where: { userId: p.userId }, data: { isPrimary: false } })
  try {
    const id = await prisma.upiId.create({ data: { userId: p.userId, accountId, upiId, isPrimary: isPrimary || false } })
    return NextResponse.json(id)
  } catch {
    return NextResponse.json({ error: "UPI ID already exists" }, { status: 409 })
  }
}
