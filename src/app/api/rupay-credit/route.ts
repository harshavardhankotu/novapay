import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const line = await prisma.ruPayCreditLine.findUnique({ where: { userId: p.userId } })
  return NextResponse.json(line || { totalLimit: 150000, usedLimit: 0, availableLimit: 150000, dueDate: new Date(Date.now() + 45*86400000).toISOString(), interestFreeDays: 45, upiEnabled: true })
}
