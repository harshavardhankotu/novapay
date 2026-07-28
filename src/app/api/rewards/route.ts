import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const rewards = await prisma.reward.findUnique({ where: { userId: payload.userId } })
  const txCount = await prisma.transaction.count({
    where: { account: { userId: payload.userId }, type: "DEBIT" },
  })

  return NextResponse.json({ ...rewards, transactionPoints: Math.floor(txCount * 10) })
}
