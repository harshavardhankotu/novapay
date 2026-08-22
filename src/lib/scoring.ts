import { prisma } from "@/lib/prisma"

/**
 * ── NovaPay Financial Health Score (P3) ──────────────────────────────────────
 * A 0–100 composite of five named factors with FIXED, documented weights.
 * Every factor returns a plain-language explanation alongside its score so a
 * user always knows WHY they scored what they scored (hard requirement).
 */

export const SCORE_WEIGHTS = {
  /** Trailing 3-month savings rate: (income − spend) / income */
  SAVINGS_RATE: 0.25,
  /** Total EMI / monthly income — debt load sustainability */
  EMI_BURDEN: 0.25,
  /** Coefficient of variation on discretionary spend across 3 months */
  SPEND_VOLATILITY: 0.15,
  /** Missed/bounced EMI + mandate payments in trailing window */
  PUNCTUALITY: 0.20,
  /** Liquid balance ÷ average monthly expense (emergency buffer) */
  EMERGENCY_FUND: 0.15,
} as const

// Sanity: weights must sum to exactly 1
const WEIGHT_SUM = Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0)
if (Math.abs(WEIGHT_SUM - 1) > 1e-9) throw new Error("SCORE_WEIGHTS must sum to 1")

export const INCOME_CATEGORIES = ["Salary", "Interest", "Reward"]
/** Spending that is optional — volatility is measured on this subset only. */
export const DISCRETIONARY_CATEGORIES = ["Food", "Shopping", "Entertainment", "Travel"]
/** Ledger categories excluded from 'spend' entirely (not consumption). */
export const NON_SPEND_CATEGORIES = ["Transfer", "Investment", "TDS"]

export interface HealthInputs {
  monthlyIncome: number
  monthlySpend: number
  monthlyEmi: number
  discretionaryByMonth: number[]
  missedPayments: number
  liquidBalance: number
}

export interface FactorScore {
  key: keyof typeof SCORE_WEIGHTS | string
  label: string
  score: number // 0–100
  weight: number
  explanation: string
}

export interface HealthResult {
  total: number
  factors: FactorScore[]
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const round2 = (x: number) => Math.round(x * 100) / 100
const NEUTRAL = 50

/** Pure scoring function — no I/O, fully unit-testable. */
export function computeHealthScore(inputs: HealthInputs): HealthResult {
  const factors: FactorScore[] = []

  // 1 ─ Savings rate: ≥30% saved → 100; ≤0% → 0; linear between.
  if (inputs.monthlyIncome <= 0) {
    factors.push({
      key: "SAVINGS_RATE", label: "Savings Rate",
      score: NEUTRAL, weight: SCORE_WEIGHTS.SAVINGS_RATE,
      explanation: "No income recorded in the last 3 months, so we can't measure your savings yet.",
    })
  } else {
    const sr = (inputs.monthlyIncome - inputs.monthlySpend) / inputs.monthlyIncome
    const score = clamp01(sr / 0.3) * 100
    factors.push({
      key: "SAVINGS_RATE", label: "Savings Rate",
      score, weight: SCORE_WEIGHTS.SAVINGS_RATE,
      explanation:
        sr >= 0.3
          ? `Strong — you're saving ${(sr * 100).toFixed(1)}% of income (target ≥30%).`
          : sr >= 0
            ? `You save ${(sr * 100).toFixed(1)}% of income. Reaching 30% would maximise this factor.`
            : `You're spending ₹${Math.abs(inputs.monthlySpend - inputs.monthlyIncome).toLocaleString("en-IN")} more than you earn each month.`,
    })
  }

  // 2 ─ EMI burden: ≤20% of income → 100; linear down to 0 at ≥50%. No loans → perfect.
  if (inputs.monthlyEmi === 0) {
    factors.push({
      key: "EMI_BURDEN", label: "EMI Burden",
      score: 100, weight: SCORE_WEIGHTS.EMI_BURDEN,
      explanation: "No active EMIs — zero debt load.",
    })
  } else if (inputs.monthlyIncome <= 0) {
    factors.push({
      key: "EMI_BURDEN", label: "EMI Burden",
      score: NEUTRAL, weight: SCORE_WEIGHTS.EMI_BURDEN,
      explanation: "You have EMIs but no detected income to compare against.",
    })
  } else {
    const ratio = inputs.monthlyEmi / inputs.monthlyIncome
    const score = clamp01((0.5 - ratio) / 0.3) * 100 // 100 @≤20%, 0 @≥50%
    factors.push({
      key: "EMI_BURDEN", label: "EMI Burden",
      score, weight: SCORE_WEIGHTS.EMI_BURDEN,
      explanation:
        ratio <= 0.2
          ? `Healthy — EMIs are ${(ratio * 100).toFixed(1)}% of income (under the 20% comfort line).`
          : ratio < 0.5
            ? `EMIs take ${(ratio * 100).toFixed(1)}% of income; under 20% is the comfort zone.`
            : `Strained — EMIs consume ${(ratio * 100).toFixed(1)}% of income (danger zone above 50%).`,
    })
  }

  // 3 ─ Spend volatility: CV of discretionary spend over 3 months.
  //    CV ≤ 0.15 → 100 (very stable), CV ≥ 0.80 → 0. No data → neutral.
  const disc = inputs.discretionaryByMonth.filter((v) => v > 0)
  if (disc.length < 2 || inputs.discretionaryByMonth.every((v) => v === 0)) {
    factors.push({
      key: "SPEND_VOLATILITY", label: "Spend Stability",
      score: NEUTRAL, weight: SCORE_WEIGHTS.SPEND_VOLATILITY,
      explanation: "Not enough discretionary spending history to measure stability yet.",
    })
  } else {
    const mean = inputs.discretionaryByMonth.reduce((a, b) => a + b, 0) / inputs.discretionaryByMonth.length
    const variance =
      inputs.discretionaryByMonth.reduce((a, b) => a + (b - mean) ** 2, 0) / inputs.discretionaryByMonth.length
    const cv = mean === 0 ? Infinity : Math.sqrt(variance) / mean
    const score = clamp01((0.8 - cv) / (0.8 - 0.15)) * 100
    factors.push({
      key: "SPEND_VOLATILITY", label: "Spend Stability",
      score, weight: SCORE_WEIGHTS.SPEND_VOLATILITY,
      explanation:
        cv <= 0.15
          ? `Very predictable month-to-month spending (variation ${(cv * 100).toFixed(0)}%).`
          : cv < 0.5
            ? `Moderately steady spending (variation ${(cv * 100).toFixed(0)}%).`
            : `Swingy spending — variation of ${(cv * 100).toFixed(0)}% between months makes budgeting harder.`,
    })
  }

  // 4 ─ Punctuality: −25 points per bounced/missed payment in window.
  {
    const score = Math.max(0, 100 - inputs.missedPayments * 25)
    factors.push({
      key: "PUNCTUALITY", label: "Payment Punctuality",
      score, weight: SCORE_WEIGHTS.PUNCTUALITY,
      explanation:
        inputs.missedPayments === 0
          ? "Clean record — every EMI and mandate has been paid on time."
          : `${inputs.missedPayments} missed payment${inputs.missedPayments > 1 ? "s" : ""} recently cost you ${inputs.missedPayments * 25} points here.`,
    })
  }

  // 5 ─ Emergency fund: liquid balance ÷ avg monthly expense.
  //     ≥6 months → 100; 0 → 0; linear between. No expense data → neutral.
  if (inputs.monthlySpend <= 0) {
    factors.push({
      key: "EMERGENCY_FUND", label: "Emergency Fund",
      score: NEUTRAL, weight: SCORE_WEIGHTS.EMERGENCY_FUND,
      explanation: "No expenses recorded yet, so we can't size your emergency buffer.",
    })
  } else {
    const monthsCovered = inputs.liquidBalance / inputs.monthlySpend
    const score = clamp01(monthsCovered / 6) * 100
    factors.push({
      key: "EMERGENCY_FUND", label: "Emergency Fund",
      score, weight: SCORE_WEIGHTS.EMERGENCY_FUND,
      explanation:
        monthsCovered >= 6
          ? `Excellent — ₹${inputs.liquidBalance.toLocaleString("en-IN")} covers ${monthsCovered.toFixed(1)} months of expenses.`
          : `Your balance covers ${monthsCovered.toFixed(1)} month(s) of expenses. Building toward 6 months earns full marks.`,
    })
  }

  const total = Math.round(factors.reduce((sum, f) => sum + f.score * f.weight, 0))
  return { total: Math.max(0, Math.min(100, total)), factors }
}

/**
 * Aggregates real ledger activity for one user into HealthInputs.
 * Window: trailing ~90 days. Deterministic and scoped strictly to the user.
 */
export async function gatherHealthInputs(userId: string): Promise<HealthInputs> {
  const since = new Date(Date.now() - 90 * 86400000)

  const [accounts, txns, loans] = await Promise.all([
    prisma.account.findMany({ where: { userId, isActive: true }, select: { balance: true } }),
    prisma.transaction.findMany({
      where: { account: { userId }, status: "COMPLETED", timestamp: { gte: since } },
      select: { type: true, amount: true, category: true, timestamp: true },
    }),
    prisma.loan.findMany({ where: { userId, status: "ACTIVE" }, select: { emiAmount: true, delinquencyCount: true } }),
  ])

  const monthlyIncome = txns
    .filter((t) => t.type === "CREDIT" && INCOME_CATEGORIES.includes(t.category ?? ""))
    .reduce((s, t) => s + Math.abs(t.amount), 0) / 3

  const spendTxns = txns.filter(
    (t) => t.type === "DEBIT" && !NON_SPEND_CATEGORIES.includes(t.category ?? "")
  )
  const monthlySpend = spendTxns.reduce((s, t) => s + Math.abs(t.amount), 0) / 3

  // Discretionary spend bucketed by calendar month (last 3 buckets)
  const discByMonth = [0, 0, 0]
  for (let i = 0; i < 3; i++) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    discByMonth[2 - i] = spendTxns
      .filter(
        (t) =>
          DISCRETIONARY_CATEGORIES.includes(t.category ?? "") &&
          `${new Date(t.timestamp).getFullYear()}-${new Date(t.timestamp).getMonth()}` === key
      )
      .reduce((s, t) => s + Math.abs(t.amount), 0)
  }

  const monthlyEmi = loans.reduce((s, l) => s + l.emiAmount, 0)
  const missedPayments = loans.reduce((s, l) => s + (l.delinquencyCount ?? 0), 0)
  const liquidBalance = accounts.reduce((s, a) => s + a.balance, 0)

  return {
    monthlyIncome: round2(monthlyIncome),
    monthlySpend: round2(monthlySpend),
    monthlyEmi: round2(monthlyEmi),
    discretionaryByMonth: discByMonth.map(round2),
    missedPayments,
    liquidBalance: round2(liquidBalance),
  }
}

/** Persist a weekly snapshot (idempotent within 7 days). Returns snapshot id or null. */
export async function upsertWeeklySnapshot(userId: string): Promise<string | null> {
  const latest = await prisma.scoreSnapshot.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
  if (latest && Date.now() - latest.createdAt.getTime() < 7 * 86400000) return null
  const inputs = await gatherHealthInputs(userId)
  const result = computeHealthScore(inputs)
  const snap = await prisma.scoreSnapshot.create({
    data: { userId, total: result.total, factorsJson: JSON.stringify(result.factors) },
  })
  return snap.id
}