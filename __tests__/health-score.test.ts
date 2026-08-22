import { describe, it, expect } from "vitest"
import { SCORE_WEIGHTS, computeHealthScore, type HealthInputs } from "../src/lib/scoring"

const base: HealthInputs = {
  monthlyIncome: 100000,
  monthlySpend: 50000,
  monthlyEmi: 10000,
  discretionaryByMonth: [8000, 9000, 7000],
  missedPayments: 0,
  liquidBalance: 300000,
}

describe("SCORE_WEIGHTS", () => {
  it("sums to exactly 1.00", () => {
    const sum = Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(1, 9)
  })
})

describe("computeHealthScore", () => {
  it("healthy profile → every factor ≥ its documented threshold behaviour", () => {
    const r = computeHealthScore(base)

    // savings rate = 50% ≥ 30% → full 100
    const sr = r.factors.find(f => f.key === "SAVINGS_RATE")!
    expect(sr.score).toBe(100)

    // EMI burden = 10% ≤ 20% → full 100
    const emi = r.factors.find(f => f.key === "EMI_BURDEN")!
    expect(emi.score).toBe(100)

    // punctuality: no misses → 100
    const pun = r.factors.find(f => f.key === "PUNCTUALITY")!
    expect(pun.score).toBe(100)

    // emergency fund = 3L / 50k = 6 months → 100
    const ef = r.factors.find(f => f.key === "EMERGENCY_FUND")!
    expect(ef.score).toBe(100)

    // volatility CV of [8k,9k,7k] ≈ 0.096 ≤ 0.15 → 100
    const vol = r.factors.find(f => f.key === "SPEND_VOLATILITY")!
    expect(vol.score).toBe(100)

    expect(r.total).toBe(100)
  })

  it("spending entire income → savings rate 0", () => {
    const r = computeHealthScore({ ...base, monthlySpend: 100000 })
    const sr = r.factors.find(f => f.key === "SAVINGS_RATE")!
    expect(sr.score).toBe(0)
  })

  it("EMI burden at 35% of income scores between the 20%/50% anchors", () => {
    const r = computeHealthScore({ ...base, monthlyEmi: 35000 })
    const emi = r.factors.find(f => f.key === "EMI_BURDEN")!
    // linear from 100 @20% to 0 @50% → at 35%: (50−35)/(50−20)=0.5 → 50
    expect(emi.score).toBeCloseTo(50, 5)
  })

  it("each bounce costs exactly 25 punctuality points, floor 0", () => {
    const one = computeHealthScore({ ...base, missedPayments: 1 })
    expect(one.factors.find(f => f.key === "PUNCTUALITY")!.score).toBe(75)
    const many = computeHealthScore({ ...base, missedPayments: 7 })
    expect(many.factors.find(f => f.key === "PUNCTUALITY")!.score).toBe(0)
  })

  it("emergency fund scales linearly toward the 6-month target", () => {
    const three = computeHealthScore({ ...base, liquidBalance: 150000 })
    expect(three.factors.find(f => f.key === "EMERGENCY_FUND")!.score).toBe(50)
  })

  it("zero income gives neutral (50) on income-dependent factors", () => {
    const r = computeHealthScore({ ...base, monthlyIncome: 0 })
    expect(r.factors.find(f => f.key === "SAVINGS_RATE")!.score).toBe(50)
    expect(r.factors.find(f => f.key === "EMI_BURDEN")!.score).toBe(50)
  })

  it("every factor carries a non-empty plain-language explanation", () => {
    const r = computeHealthScore(base)
    for (const f of r.factors) {
      expect(f.explanation.length).toBeGreaterThan(10)
      expect(typeof f.weight).toBe("number")
      expect(Object.values(SCORE_WEIGHTS)).toContain(f.weight)
    }
  })

  it("total is the exact weighted sum and stays within 0–100", () => {
    const inputs: HealthInputs = { ...base, monthlySpend: 85000, monthlyEmi: 45000, missedPayments: 2, liquidBalance: 20000 }
    const r = computeHealthScore(inputs)
    const weighted = Math.round(r.factors.reduce((s, f) => s + f.score * f.weight, 0))
    expect(r.total).toBe(weighted)
    expect(r.total).toBeGreaterThanOrEqual(0)
    expect(r.total).toBeLessThanOrEqual(100)
    // A clearly distressed profile must score below a healthy one
    expect(r.total).toBeLessThan(computeHealthScore(base).total)
  })
})