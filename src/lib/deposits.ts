import { prisma } from "@/lib/prisma"

// ─── Rate slabs (admin-configurable, historically tracked) ───────────────────

export async function getSlabRate(product: string, amount: number, tenureMonths?: number): Promise<number> {
  const now = new Date()
  const slabs = await prisma.rateSlab.findMany({
    where: { product, effectiveFrom: { lte: now }, OR: [{ retiredAt: null }, { retiredAt: { gt: now } }] },
    orderBy: { effectiveFrom: "desc" },
  })
  const match =
    slabs.find(
      (s) =>
        amount >= s.minAmount &&
        (s.maxAmount == null || amount <= s.maxAmount) &&
        (s.tenureMonths == null || tenureMonths == null || s.tenureMonths === tenureMonths)
    ) ?? null
  if (match) return match.rate
  // Fallback defaults when admin hasn't configured slabs yet
  return product === "SAVINGS" ? 3.5 : product === "RD" ? 6.5 : 7.0
}

// ─── Compounding math ────────────────────────────────────────────────────────

/** FD: compounded QUARTERLY (standard Indian bank practice). */
export function fdMaturity(principal: number, annualRatePct: number, months: number): number {
  const quarters = Math.round((months / 12) * 4)
  const r = annualRatePct / 400
  return Math.round(principal * Math.pow(1 + r, quarters) * 100) / 100
}

/** RD: each installment compounds quarterly for the remainder of the tenure. */
export function rdMaturity(monthlyAmount: number, annualRatePct: number, months: number): number {
  const r = annualRatePct / 400
  let total = 0
  const installments = months
  for (let i = 0; i < installments; i++) {
    const quartersRemaining = Math.round(((months - i) / 12) * 4)
    total += monthlyAmount * Math.pow(1 + r, quartersRemaining)
  }
  return Math.round(total * 100) / 100
}

// ─── TDS (simulated §194A): ₹40,000 threshold, ₹50,000 for senior citizens ──

export const TDS_RATE = 0.10

export function fyLabel(date: Date): string {
  const y = date.getFullYear()
  // Indian FY: April–March
  return date.getMonth() >= 3 ? `FY${y}-${String(y + 1).slice(2)}` : `FY${y - 1}-${String(y).slice(2)}`
}

export interface TdsResult {
  tds: number
  netInterest: number
  crossedThreshold: boolean
}

export async function computeTds(userId: string, fdGrossInterest: number): Promise<TdsResult> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { seniorCitizen: true } })
  const threshold = user?.seniorCitizen ? 50_000 : 40_000
  const fy = fyLabel(new Date())

  const summary = await prisma.tdsSummary.upsert({
    where: { userId_fyYear: { userId, fyYear: fy } },
    create: { userId, fyYear: fy, cumulativeInterest: 0, tdsDeducted: 0 },
    update: {},
  })

  const before = summary.cumulativeInterest
  const after = before + fdGrossInterest
  let tds = 0

  if (before <= threshold && after > threshold) {
    // Crossed this entry: deduct on the excess portion beyond the threshold
    tds = Math.round(((after - threshold) * TDS_RATE + Math.max(0, fdGrossInterest - (after - threshold)) * 0) * 100) / 100
  } else if (after > threshold) {
    // Already above threshold: deduct on the full interest
    tds = Math.round(fdGrossInterest * TDS_RATE * 100) / 100
  }
  tds = Math.min(tds, fdGrossInterest)

  await prisma.tdsSummary.update({
    where: { id: summary.id },
    data: { cumulativeInterest: after, tdsDeducted: { increment: tds } },
  })

  return { tds, netInterest: fdGrossInterest - tds, crossedThreshold: after > threshold }
}

// ─── Savings interest (monthly simple credit at slab rate / 12) ──────────────

export function savingsMonthlyInterest(balance: number, annualRatePct: number): number {
  return Math.round(((balance * annualRatePct) / 12 / 100) * 100) / 100
}
