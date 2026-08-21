import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload || payload.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const since14d = new Date(Date.now() - 14 * 86400000)

  const [
    totalUsers,
    activeUsers,
    pendingKyc,
    totalAccounts,
    totalCards,
    totalTransactions,
    txVolume,
    waitlistTotal,
    recentWaitlist,
    clickTotal,
    clicksBySlotRaw,
    clicksLast14d,
    recentClicks,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { kycLevel: "UNVERIFIED" } }),
    prisma.account.count(),
    prisma.card.count(),
    prisma.transaction.count(),
    prisma.transaction.aggregate({ _sum: { amount: true } }),
    prisma.waitlistEntry.count(),
    prisma.waitlistEntry.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.affiliateClick.count(),
    prisma.affiliateClick.groupBy({
      by: ["slotId"],
      _count: { slotId: true },
      orderBy: { _count: { slotId: "desc" } },
    }),
    prisma.affiliateClick.count({ where: { createdAt: { gte: since14d } } }),
    prisma.affiliateClick.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true, email: true } } },
    }),
  ])

  // Waitlist signups per day for the last 14 days (for the chart)
  const waitlistRecent = await prisma.waitlistEntry.findMany({
    where: { createdAt: { gte: since14d } },
    select: { createdAt: true },
  })
  const daily: { date: string; count: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86400000)
    const key = day.toISOString().slice(0, 10)
    daily.push({ date: key, count: 0 })
  }
  for (const w of waitlistRecent) {
    const key = w.createdAt.toISOString().slice(0, 10)
    const bucket = daily.find((d) => d.date === key)
    if (bucket) bucket.count++
  }

  return NextResponse.json({
    platform: {
      totalUsers,
      activeUsers,
      pendingKyc,
      totalAccounts,
      totalCards,
      totalTransactions,
      totalVolume: txVolume._sum.amount || 0,
    },
    revenue: {
      waitlistTotal,
      waitlistLast14d: waitlistRecent.length,
      dailyWaitlist: daily,
      recentWaitlist,
      clickTotal,
      clicksLast14d,
      clicksBySlot: clicksBySlotRaw.map((c) => ({ slotId: c.slotId, clicks: c._count.slotId })),
      recentClicks,
    },
  })
}