import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get("accountId")
  const limit = parseInt(searchParams.get("limit") || "20")
  const offset = parseInt(searchParams.get("offset") || "0")

  const where: any = { account: { userId: payload.userId } }
  if (accountId) where.accountId = accountId

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: limit,
    skip: offset,
    include: { account: { select: { currency: true } } },
  })

  const total = await prisma.transaction.count({ where })

  return NextResponse.json({ transactions, total, limit, offset })
}
