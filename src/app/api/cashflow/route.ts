import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { projectBalance } from "@/lib/cashflow"
import { DISCRETIONARY_CATEGORIES } from "@/lib/scoring"

const DAY = 86400000

export async function GET(request: Request) {
  const t = getTokenFromCookies(request)
  const p = t ? verifyToken(t) : null
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const horizonDays = Math.min(
      60,
      Math.max(30, parseInt(new URL(request.url).searchParams.get("days") || "45", 10) || 45)
    )

    const accounts = await prisma.account.findMany({
      where: { userId: p.userId, isActive: true },
      select: { id: true, balance: true },
    })
    const startBalance = accounts.reduce((s, a) => s + a.balance, 0)
    const accountIds = accounts.map((a) => a.id)

    // ── Recurring income detection: ≥2 similar salary credits ~monthly ──
    const since90 = new Date(Date.now() - 90 * DAY)
    const incomeTxns = await prisma.transaction.findMany({
      where: {
        accountId: { in: accountIds },
        type: "CREDIT",
        category: "Salary",
        status: "COMPLETED",
        timestamp: { gte: since90 },
      },
      orderBy: { timestamp: "asc" },
      select: { amount: true, timestamp: true, counterparty: true },
    })

    const recurringIncome: { label: string; amount: number; nextDate: Date }[] = []
    if (incomeTxns.length >= 2) {
      // Group by counterparty and take groups with ≥2 hits
      const groups = new Map<string, typeof incomeTxns>()
      for (const t of incomeTxns) {
        const key = t.counterparty || "Employer"
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key)!.push(t)
      }
      for (const [key, list] of groups) {
        if (list.length < 2) continue
        const avgAmount = round2(list.reduce((s, x) => s + x.amount, 0) / list.length)
        const latest = list[list.length - 1]
        const nextDate = new Date(latest.timestamp.getTime() + 30 * DAY)
        recurringIncome.push({
          label: `Salary — ${key}`,
          amount: avgAmount,
          nextDate,
        })
      }
    }

    // ── Scheduled debits: EMIs (stored schedule), mandates, standing instructions ──
    const horizonEnd = new Date(Date.now() + horizonDays * DAY)
    const scheduledDebits: { label: string; amount: number; dueDate: Date }[] = []

    const unpaidInstallments = await prisma.amortizationInstallment.findMany({
      where: { paidAt: null, dueDate: { lte: horizonEnd }, loan: { userId: p.userId, status: "ACTIVE" } },
      orderBy: { dueDate: "asc" },
      take: 10,
    })
    for (const i of unpaidInstallments) {
      scheduledDebits.push({ label: `${i.no === 1 ? "" : ""}Loan EMI #${i.no}`, amount: i.total, dueDate: new Date(i.dueDate) })
    }

    const mandates = await prisma.paymentMandate.findMany({
      where: { userId: p.userId, status: "ACTIVE", nextRun: { lte: horizonEnd } },
      select: { id: true, name: true, amount: true, nextRun: true },
    })
    for (const m of mandates) {
      scheduledDebits.push({ label: `Mandate · ${m.name}`, amount: m.amount, dueDate: new Date(m.nextRun) })
    }

    const sis = await prisma.standingInstruction.findMany({
      where: { userId: p.userId, active: true, nextRun: { lte: horizonEnd } },
      select: { amount: true, nextRun: true, note: true },
    })
    for (const si of sis) {
      scheduledDebits.push({ label: `Sweep${si.note ? ` · ${si.note}` : ""}`, amount: si.amount, dueDate: new Date(si.nextRun) })
    }

    // ── Weekday discretionary pattern (last 8 weeks of debit txns) ──
    const since8w = new Date(Date.now() - 56 * DAY)
    const spendTxns = await prisma.transaction.findMany({
      where: {
        accountId: { in: accountIds },
        type: "DEBIT",
        status: "COMPLETED",
        timestamp: { gte: since8w },
        category: { notIn: ["Transfer", "Investment", "TDS", "Loan"] },
      },
      select: { amount: true, timestamp: true, category: true },
    })

    const weekdayTotals = [0, 0, 0, 0, 0, 0, 0]
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0]
    for (let w = 0; w < 8; w++) {
      for (let d = 0; d < 7; d++) weekdayCounts[d]++
    }
    for (const txn of spendTxns) {
      const cat = txn.category ?? ""
      if (!DISCRETIONARY_CATEGORIES.includes(cat)) continue
      weekdayTotals[new Date(txn.timestamp).getDay()] += Math.abs(txn.amount)
    }
    const weekdaySpend = weekdayTotals.map((total, i) =>
      round2(total / Math.max(1, weekdayCounts[i]))
    )

    // ── Project ──
    const projection = projectBalance({
      startBalance,
      startDate: new Date(),
      horizonDays,
      recurringIncome,
      scheduledDebits,
      weekdaySpend,
    })

    return NextResponse.json({
      startBalance: round2(startBalance),
      horizonDays,
      recurringIncomeCount: recurringIncome.length,
      scheduledDebitCount: scheduledDebits.length,
      shortfall: projection.shortfall,
      days: projection.days.map((d) => ({
        date: d.date,
        inflow: d.inflow,
        outflow: d.outflow,
        closing: d.closing,
        events: d.events,
      })),
    })
  } catch (e) {
    console.error("cashflow failed:", e)
    return NextResponse.json({ error: "Projection failed" }, { status: 500 })
  }
}

function round2(x: number): number {
  return Math.round(x * 100) / 100
}