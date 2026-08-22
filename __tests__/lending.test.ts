import { describe, it, expect } from "vitest"
import {
  computeEmi, buildSchedule, reverseEmi, nextCollectionsStatus,
} from "../src/lib/lending"

describe("computeEmi (reducing balance)", () => {
  it("matches the standard EMI formula for ₹1L @11% 12m", () => {
    const r = 11 / 1200
    const f = Math.pow(1 + r, 12)
    const expected = Math.round((100000 * r * f) / (f - 1) * 100) / 100
    expect(computeEmi(100000, 11, 12)).toBe(expected)
  })

  it("zero rate → simple division", () => {
    expect(computeEmi(12000, 0, 12)).toBe(1000)
  })
})

describe("buildSchedule (stored amortization source of truth)", () => {
  const s = buildSchedule(100000, 11, 12, new Date("2026-01-15T10:00:00Z"))

  it("principal installments sum to exactly the principal", () => {
    const sum = s.installments.reduce((a, i) => a + i.principal, 0)
    expect(Math.round(sum * 100) / 100).toBe(100000)
  })

  it("final installment closes the balance to zero", () => {
    const last = s.installments[s.installments.length - 1]
    const closing = last.openingBalance - last.principal
    expect(Math.abs(closing)).toBeLessThan(0.005)
  })

  it("each installment: opening − principal = next opening (chain integrity)", () => {
    for (let i = 1; i < s.installments.length; i++) {
      const prev = s.installments[i - 1]
      const cur = s.installments[i]
      expect(cur.openingBalance).toBeCloseTo(prev.openingBalance - prev.principal, 2)
    }
  })

  it("interest per installment equals opening × monthly rate (±paise rounding)", () => {
    const first = s.installments[0]
    const expectedInterest = 100000 * (11 / 1200)
    expect(first.interest).toBeCloseTo(expectedInterest, 0)
  })

  it("total interest is positive and schedule has exactly n rows", () => {
    expect(s.totalInterest).toBeGreaterThan(0)
    expect(s.installments).toHaveLength(12)
  })
})

describe("reverseEmi (affordability solver)", () => {
  it("is the inverse of computeEmi within paise tolerance", () => {
    const emi = computeEmi(250000, 11, 24)
    const solvedPrincipal = reverseEmi(emi, 11, 24)
    expect(solvedPrincipal).toBeCloseTo(250000, -1) // within ~₹10
  })

  it("zero headroom → zero affordable principal", () => {
    expect(reverseEmi(0, 11, 24)).toBe(0)
  })
})

describe("delinquency collections ladder", () => {
  it("CURRENT → SOFT at 2 bounces → HARD at 4+", () => {
    expect(nextCollectionsStatus(0)).toBe("CURRENT")
    expect(nextCollectionsStatus(1)).toBe("CURRENT")
    expect(nextCollectionsStatus(2)).toBe("SOFT")
    expect(nextCollectionsStatus(3)).toBe("SOFT")
    expect(nextCollectionsStatus(4)).toBe("HARD")
    expect(nextCollectionsStatus(9)).toBe("HARD")
  })
})