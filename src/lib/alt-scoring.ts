import { prisma } from "@/lib/prisma"

/**
 * ── Alternative credit scoring (P8) ──────────────────────────────────────────
 * A SECOND model, deliberately separate from the P3 Financial Health Score.
 * Purpose: lend responsibly to THIN-FILE users who lack formal credit history.
 *
 * Signals (per spec):
 *   • UPI/transaction regularity        — how many of the last 90 days saw activity
 *   • Recurring bill payment consistency — completed utility/bill payments
 *   • In-app EMI repayment history       — paid vs missed installments
 *   • Income-stability VARIANCE is REPORTED but never scored against the user —
 *     gig-style irregular income must not look like missed payments.
 */

export const ALT_WEIGHTS = {
  REGULARITY: 0.40,
  BILL_CONSISTENCY: 0.35,
  EMI_HISTORY: 0.25,
} as const

/** Below this many 90-day transactions a user counts as "thin file". */
export const THIN_FILE_TXN_THRESHOLD = 10

export interface AltScoreInputs {
  txnCount90d: number
  activeDays90: number          // distinct days with at least one transaction
  recurringBillsCompleted: number
  emiRepaidCount: number
  emiMissedCount: number
  incomeVarianceReported: number // stdev of monthly incomes — informational only
}

export interface AltDecision {
  thinFile: boolean
  decision: "APPROVE" | "APPROVE_WITH_LIMIT" | "DECLINE"
  suggestedLimitMultiplier: number // × monthly income equivalent
  reasons: string[]
  signals: { regularity: number; consistency: number; emiHistory: number }
  composite: number
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))

export function computeAltScore(inputs: AltScoreInputs): AltDecision {
  const reasons: string[] = []
  const thinFile = inputs.txnCount90d < THIN_FILE_TXN_THRESHOLD

  // Regularity: fraction of days with activity
  const regularity = clamp01(inputs.activeDays90 / 90)

  // Bill consistency: 3+ recurring payments in window = fully consistent
  const consistency = clamp01(inputs.recurringBillsCompleted / 3)

  // EMI history: repayment ratio; no history → neutral 50 (never punished for absence)
  let emiHistory = 50
  if (inputs.emiRepaidCount + inputs.emiMissedCount > 0) {
    emiHistory =
      (inputs.emiRepaidCount / (inputs.emiRepaidCount + inputs.emiMissedCount)) * 100
  }

  const composite = Math.round(
    regularity * 100 * ALT_WEIGHTS.REGULARITY +
    consistency * 100 * ALT_WEIGHTS.BILL_CONSISTENCY +
    emiHistory * ALT_WEIGHTS.EMI_HISTORY
  )

  // ── Reasons built strictly from driving signals ──
  if (inputs.activeDays90 >= 45) {
    reasons.push(`Active on ${inputs.activeDays90} of the last 90 days — strong usage regularity.`)
  } else if (inputs.activeDays90 >= 20) {
    reasons.push(`Moderate activity (${inputs.activeDays90} active days in 90).`)
  } else {
    reasons.push(`Light activity so far (${inputs.activeDays90} active days in 90).`)
  }

  if (inputs.recurringBillsCompleted >= 3) {
    reasons.push(`${inputs.recurringBillsCompleted} recurring bills paid on schedule — dependable payment behaviour.`)
  } else if (inputs.recurringBillsCompleted > 0) {
    reasons.push(`Only ${inputs.recurringBillsCompleted} recurring bill payment(s) recorded; more history would help.`)
  } else {
    reasons.push("No recurring bill payments observed yet.")
  }

  if (inputs.emiRepaidCount + inputs.emiMissedCount === 0) {
    reasons.push("No in-app EMIs yet — EMI factor held neutral rather than counting it against you.")
  } else if (inputs.emiMissedCount === 0) {
    reasons.push(`All ${inputs.emiRepaidCount} in-app EMI(s) repaid without a miss.`)
  } else {
    reasons.push(`${inputs.emiMissedCount} missed EMI(s) weighed against ${inputs.emiRepaidCount} repaid.`)
  }

  // Income variance: explicitly informational
  if (inputs.incomeVarianceReported > 0) {
    reasons.push(
      `Income varies month-to-month (σ ≈ ₹${Math.round(inputs.incomeVarianceReported).toLocaleString("en-IN")}) — noted for context, and NOT counted against you.`
    )
  }

  // ── Decision mapping ──
  let decision: AltDecision["decision"]
  let suggestedLimitMultiplier: number

  if (composite >= 65 && inputs.emiMissedCount === 0) {
    decision = "APPROVE"
    suggestedLimitMultiplier = composite >= 80 ? 4 : 3
    reasons.push(`Alternative score ${composite}/100 clears the 65-point approval bar.`)
  } else if (composite >= 40 && inputs.emiMissedCount <= 1) {
    decision = "APPROVE_WITH_LIMIT"
    suggestedLimitMultiplier = composite >= 50 ? 2 : 1
    reasons.push(`Alternative score ${composite}/100 supports lending with a conservative limit.`)
  } else {
    decision = "DECLINE"
    suggestedLimitMultiplier = 0
    reasons.push(
      inputs.emiMissedCount >= 2
        ? `${inputs.emiMissedCount} missed repayments push this below our approval line.`
        : `Alternative score ${composite}/100 is below the 40-point minimum for sanction.`
    )
  }

  return {
    thinFile,
    decision,
    suggestedLimitMultiplier,
    reasons,
    signals: { regularity: Math.round(regularity * 100), consistency: Math.round(consistency * 100), emiHistory: Math.round(emiHistory) },
    composite,
  }
}

/** Aggregates real ledger data into AltScoreInputs for one user. */
export async function gatherAltInputs(userId: string): Promise<AltScoreInputs> {
  const since90 = new Date(Date.now() - 90 * 86400000)
  const accounts = await prisma.account.findMany({ where: { userId }, select: { id: true } })
  const ids = accounts.map((a) => a.id)

  const [txns, bills, installments, loans] = await Promise.all([
    ids.length ? prisma.transaction.findMany({
      where: { accountId: { in: ids }, status: "COMPLETED", timestamp: { gte: since90 } },
      select: { type: true, amount: true, category: true, timestamp: true },
    }) : Promise.resolve([] as any[]),
    prisma.billPayment.count({ where: { userId } }),
    ids.length ? prisma.amortizationInstallment.findMany({
      where: { loan: { userId }, paidAt: { not: null } },
      select: { paidAt: true },
    }) : Promise.resolve([] as any[]),
    prisma.loan.findMany({ where: { userId }, select: { delinquencyCount: true } }),
  ])

  const activeDays = new Set((txns as any[]).map((t: any) => new Date(t.timestamp).toDateString()))
  const emiMissedCount = loans.reduce((s, l) => s + (l.delinquencyCount ?? 0), 0)

  // Monthly income totals across the window (for the variance report only)
  const byMonth = new Map<string, number>()
  for (const t of txns as any[]) {
    if (t.type === "CREDIT" && t.category === "Salary") {
      const k = `${new Date(t.timestamp).getFullYear()}-${new Date(t.timestamp).getMonth()}`
      byMonth.set(k, (byMonth.get(k) ?? 0) + t.amount)
    }
  }
  const incomes = [...byMonth.values()]
  let variance = 0
  if (incomes.length >= 2) {
    const mean = incomes.reduce((a, b) => a + b, 0) / incomes.length
    variance = Math.sqrt(incomes.reduce((a, b) => a + (b - mean) ** 2, 0) / incomes.length)
  }

  return {
    txnCount90d: (txns as any[]).length,
    activeDays90: activeDays.size,
    recurringBillsCompleted: bills,
    emiRepaidCount: (installments as any[]).length,
    emiMissedCount,
    incomeVarianceReported: Math.round(variance),
  }
}