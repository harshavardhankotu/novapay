import { prisma } from "@/lib/prisma"
import { gatherHealthInputs, computeHealthScore } from "@/lib/scoring"

/**
 * ── Lending primitives (P2) ──────────────────────────────────────────────────
 * Reducing-balance amortization + eligibility wired to the P3 Financial
 * Health Score. All math pure where possible so it is unit-testable.
 */

export const LENDING_RATE_DEFAULT = 11 // % p.a. — NovaPay simulated personal-loan rate
export const MAX_BURDEN_RATIO = 0.5 // post-loan EMI may not exceed 50% of income

export interface Installment {
  no: number
  dueDate: Date
  openingBalance: number
  principal: number
  interest: number
  total: number
}

export interface Schedule {
  emi: number
  totalInterest: number
  installments: Installment[]
}

/** Reducing-balance EMI: P·r·(1+r)^n / ((1+r)^n − 1), r = monthly rate. */
export function computeEmi(principal: number, annualRatePct: number, months: number): number {
  const r = annualRatePct / 1200
  if (r === 0) return Math.round((principal / months) * 100) / 100
  const factor = Math.pow(1 + r, months)
  return Math.round(((principal * r * factor) / (factor - 1)) * 100) / 100
}

/** Full reducing-balance schedule; final installment closes exactly to zero. */
export function buildSchedule(
  principal: number,
  annualRatePct: number,
  months: number,
  startDate: Date
): Schedule {
  const r = annualRatePct / 1200
  const emi = computeEmi(principal, annualRatePct, months)
  const installments: Installment[] = []
  let opening = Math.round(principal * 100) / 100
  let totalInterest = 0

  for (let i = 1; i <= months; i++) {
    const dueDate = new Date(startDate)
    dueDate.setMonth(dueDate.getMonth() + i)
    const interest = Math.round(opening * r * 100) / 100
    let principalPart = Math.round((emi - interest) * 100) / 100
    if (i === months || principalPart > opening) {
      // Final (or over-paying) installment closes the loan exactly
      principalPart = opening
    }
    const total = Math.round((principalPart + interest) * 100) / 100
    const closing = Math.round((opening - principalPart) * 100) / 100

    installments.push({
      no: i,
      dueDate,
      openingBalance: opening,
      principal: principalPart,
      interest,
      total,
    })
    totalInterest += interest
    opening = closing
    if (opening <= 0) break
  }

  return { emi, totalInterest: Math.round(totalInterest * 100) / 100, installments }
}

// ─── Eligibility (wired to P3 Financial Health Score) ────────────────────────

export type Decision = "APPROVE" | "APPROVE_WITH_LIMIT" | "DECLINE"

export interface EligibilityResult {
  decision: Decision
  approvedAmount: number
  rate: number
  reasons: string[]
  healthScore: number
}

/**
 * Rules (all stated in plain language in `reasons`):
 *  1. FULL KYC required.
 *  2. Health score ≥ 60 → clean approve at requested amount.
 *     40–59 → approve but capped by affordability. <40 → decline.
 *  3. Post-loan EMI burden must stay ≤50% of detected monthly income;
 *     otherwise the amount is cut to what keeps the burden legal.
 */
export async function evaluateEligibility(
  userId: string,
  requestedAmount: number,
  tenureMonths: number
): Promise<EligibilityResult> {
  const reasons: string[] = []
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycLevel: true },
  })

  if (user?.kycLevel !== "FULL") {
    return {
      decision: "DECLINE",
      approvedAmount: 0,
      rate: LENDING_RATE_DEFAULT,
      reasons: ["Full KYC is required before a loan can be sanctioned."],
      healthScore: 0,
    }
  }

  const inputs = await gatherHealthInputs(userId)
  const health = computeHealthScore(inputs)
  const score = health.total
  const rate = LENDING_RATE_DEFAULT

  // Affordability: how much EMI headroom remains under the 50% ceiling?
  const maxEmiTotal = inputs.monthlyIncome * MAX_BURDEN_RATIO
  const emiHeadroom = Math.max(0, maxEmiTotal - inputs.monthlyEmi)

  // Reverse-solve: biggest principal whose EMI fits the headroom
  const affordablePrincipal = reverseEmi(emiHeadroom, rate, tenureMonths)

  const existingActive = await prisma.loan.count({ where: { userId, status: "ACTIVE" } })
  let decision: Decision
  let approvedAmount = requestedAmount

  if (inputs.monthlyIncome <= 0) {
    decision = "DECLINE"
    reasons.push("We could not detect regular income in your account over the last 90 days.")
  } else if (score < 40) {
    decision = "DECLINE"
    reasons.push(`Your financial health score (${score}/100) is below our minimum of 40 for sanction.`)
  } else if (score >= 60 && affordablePrincipal >= requestedAmount) {
    decision = "APPROVE"
    reasons.push(`Financial Health Score ${score}/100 meets the ≥60 bar for full approval.`)
    reasons.push(`Post-loan EMIs stay within ${(MAX_BURDEN_RATIO * 100).toFixed(0)}% of your detected income.`)
  } else {
    decision = "APPROVE_WITH_LIMIT"
    approvedAmount = Math.min(requestedAmount, Math.floor(affordablePrincipal))
    if (score < 60) {
      reasons.push(`Score ${score}/100 sits between 40–59: we can lend, but at a reduced amount.`)
    }
    if (affordablePrincipal < requestedAmount) {
      reasons.push(
        `Capped at ₹${approvedAmount.toLocaleString("en-IN")} so your total EMIs stay within ${MAX_BURDEN_RATIO * 100}% of your ~₹${Math.round(inputs.monthlyIncome).toLocaleString("en-IN")} monthly income.`
      )
    }
    if (existingActive > 0) {
      reasons.push(`${existingActive} active loan${existingActive > 1 ? "s" : ""} already factored into your affordability check.`)
    }
  }

  if (decision !== "DECLINE" && approvedAmount <= 0) {
    decision = "DECLINE"
    reasons.push("No EMI headroom available under the 50% income-ceiling right now.")
  }

  return { decision, approvedAmount: Math.max(0, approvedAmount), rate, reasons, healthScore: score }
}

/** Biggest principal whose reducing-balance EMI equals `targetEmi`. */
export function reverseEmi(targetEmi: number, annualRatePct: number, months: number): number {
  if (targetEmi <= 0) return 0
  const r = annualRatePct / 1200
  const factor = Math.pow(1 + r, months)
  const p = (targetEmi * (factor - 1)) / (r * factor)
  return Math.round(Math.max(0, p) * 100) / 100
}

// ─── Delinquency ladder (called by the jobs processor) ───────────────────────

export function nextCollectionsStatus(consecutiveBounces: number): string {
  if (consecutiveBounces >= 4) return "HARD"
  if (consecutiveBounces >= 2) return "SOFT"
  return "CURRENT"
}