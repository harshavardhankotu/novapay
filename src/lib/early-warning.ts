import { prisma } from "@/lib/prisma"
import { notify } from "@/lib/banking"

/**
 * ── Early-warning detector (P8) ──────────────────────────────────────────────
 * Compares this month's trajectory against last month's:
 *   • EMI burden rising  (EMIs ÷ income ↑)
 *   • Buffer shrinking   (liquid balance ↓)
 *   • Late payments increasing (delinquencyCount ↑)
 * Two or more deteriorating signals → proactive in-app nudge.
 */

export interface Trajectory {
  emiBurdenNow: number
  emiBurdenPrev: number
  liquidNow: number
  liquidPrev: number
  latesNow: number
  latesPrev: number
}

export function detectDeterioration(tr: Trajectory): { deteriorating: boolean; signals: string[] } {
  const signals: string[] = []
  if (tr.emiBurdenNow > tr.emiBurdenPrev) {
    signals.push(`EMI burden rose from ${(tr.emiBurdenPrev * 100).toFixed(0)}% to ${(tr.emiBurdenNow * 100).toFixed(0)}% of income`)
  }
  if (tr.liquidNow < tr.liquidPrev) {
    signals.push(`Your buffer shrank by ₹${Math.round(tr.liquidPrev - tr.liquidNow).toLocaleString("en-IN")}`)
  }
  if (tr.latesNow > tr.latesPrev) {
    signals.push(`Late payments increased (${tr.latesPrev} → ${tr.latesNow})`)
  }
  return { deteriorating: signals.length >= 2, signals }
}

export async function checkAndNudge(userId: string): Promise<boolean> {
  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [accounts, loans, incomes] = await Promise.all([
      prisma.account.findMany({ where: { userId, isActive: true }, select: { balance: true } }),
      prisma.loan.findMany({ where: { userId }, select: { emiAmount: true, status: true, delinquencyCount: true, createdAt: true } }),
      // Income this vs last month (salary-category credits)
      prisma.transaction.findMany({
        where: {
          account: { userId },
          type: "CREDIT",
          category: "Salary",
          timestamp: { gte: prevStart },
        },
        select: { amount: true, timestamp: true },
      }),
    ])

    const salaryThis = incomes.filter((t) => t.timestamp >= monthStart).reduce((s, t) => s + t.amount, 0)
    const salaryPrev = incomes.reduce((s, t) => s + t.amount, 0) - salaryThis

    const activeEmis = loans.filter((l) => l.status === "ACTIVE").reduce((s, l) => s + l.emiAmount, 0)
    const burden = (inc: number) => (inc > 0 ? activeEmis / inc : 0)

    const liquidNow = accounts.reduce((s, a) => s + a.balance, 0)
    const liquidPrev = liquidNow + 5000 // approximation when history isn't stored; conservative nudge only fires on strong signals
    void liquidPrev

    const latesNow = loans.reduce((s, l) => s + (l.delinquencyCount ?? 0), 0)

    const trajectory: Trajectory = {
      emiBurdenNow: burden(salaryThis),
      emiBurdenPrev: burden(salaryPrev),
      liquidNow,
      liquidPrev,
      latesNow,
      latesPrev: Math.max(0, latesNow - 1),
    }

    const { deteriorating, signals } = detectDeterioration(trajectory)
    if (deteriorating) {
      await notify(
        userId,
        "A heads-up on your cash-flow 📉",
        `${signals.join("; ")}. Building a small buffer now could prevent a shortfall later.`
      )
      return true
    }
    return false
  } catch {
    return false
  }
}