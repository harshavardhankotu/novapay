import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload || payload.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const [totalUsers, activeToday, pendingKyc, totalTransactions, accounts, cards, budgets] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { kycLevel: "UNVERIFIED" } }),
    prisma.transaction.aggregate({ _sum: { amount: true } }),
    prisma.account.count(),
    prisma.card.count(),
    prisma.budget.count(),
  ])

  const recentUsers = await prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, kycLevel: true, createdAt: true },
  })

  return NextResponse.json({
    stats: {
      totalUsers,
      activeToday,
      pendingKyc,
      totalVolume: totalTransactions._sum.amount || 0,
      totalAccounts: accounts,
      totalCards: cards,
      totalBudgets: budgets,
    },
    recentUsers,
  })
}
