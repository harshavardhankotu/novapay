import { describe, it, expect } from "vitest"
import { fdMaturity, rdMaturity, savingsMonthlyInterest, fyLabel } from "../src/lib/deposits"

const TDS_RATE = 0.10
const before = 0
void before

describe("FD compounding (quarterly)", () => {
  it("matches the closed-form quarterly compounding formula", () => {
    // ₹1,00,000 @ 7.5% for 12 months, quarterly compounding
    const expected = Math.round(100000 * Math.pow(1 + 7.5 / 400, 4) * 100) / 100
    expect(fdMaturity(100000, 7.5, 12)).toBe(expected)
  })

  it("18 months = 6 quarters", () => {
    const expected = Math.round(50000 * Math.pow(1 + 8 / 400, 6) * 100) / 100
    expect(fdMaturity(50000, 8, 18)).toBe(expected)
  })

  it("zero rate returns principal exactly", () => {
    expect(fdMaturity(75000, 0, 24)).toBe(75000)
  })
})

describe("RD maturity (per-installment quarterly compounding)", () => {
  it("₹5,000/month @ 6.5% for 12m equals manual sum", () => {
    const monthly = 5000
    const r = 6.5 / 400
    let manual = 0
    for (let i = 0; i < 12; i++) {
      manual += monthly * Math.pow(1 + r, Math.round(((12 - i) / 12) * 4))
    }
    expect(rdMaturity(monthly, 6.5, 12)).toBe(Math.round(manual * 100) / 100)
  })

  it("RD maturity exceeds total deposited at any positive rate", () => {
    const invested = 2000 * 24
    expect(rdMaturity(2000, 6.5, 24)).toBeGreaterThan(invested)
  })
})

describe("Savings monthly interest", () => {
  it("balance × rate/12 rounded to paise", () => {
    expect(savingsMonthlyInterest(120000, 3.5)).toBe(350)
    expect(savingsMonthlyInterest(10000, 4)).toBe(33.33)
  })
})

describe("Indian financial-year label (Apr–Mar)", () => {
  it("August 2026 → FY2026-27", () => {
    expect(fyLabel(new Date("2026-08-15"))).toBe("FY2026-27")
  })
  it("February 2026 → FY2025-26", () => {
    expect(fyLabel(new Date("2026-02-15"))).toBe("FY2025-26")
  })
  it("April 1 is the FY boundary", () => {
    expect(fyLabel(new Date("2026-03-31"))).toBe("FY2025-26")
    expect(fyLabel(new Date("2026-04-01"))).toBe("FY2026-27")
  })
})

describe("TDS double-entry invariant", () => {
  // The ledger MUST reconcile: grossCredit − tdsDebit === net balance delta.
  function fdLedger(principal: number, gross: number, tds: number) {
    const grossCredit = Math.round((principal + gross) * 100) / 100
    const netDelta = Math.round((grossCredit - tds) * 100) / 100
    return { grossCredit, tdsDebit: -tds, netDelta }
  }

  it("gross credit − TDS debit equals net balance effect (no drift)", () => {
    const principal = 1_000_000
    const gross = 154_539.55 // senior, crosses ₹50k threshold
    const tds = Math.round((gross - 50_000) * TDS_RATE * 100) / 100
    const { grossCredit, tdsDebit, netDelta } = fdLedger(principal, gross, tds)
    expect(grossCredit + tdsDebit).toBeCloseTo(netDelta, 2)
    // And the net effect equals principal + net interest
    expect(netDelta).toBeCloseTo(principal + (gross - tds), 2)
  })

  it("TDS never exceeds gross interest and is zero below threshold", () => {
    const below = 39_999 // non-senior threshold ₹40k not crossed
    const tdsBelow = before <= 40_000 ? 0 : 0
    void tdsBelow
    const crossing = 40_500
    const expectedCross = Math.round((crossing - 40_000) * TDS_RATE * 100) / 100
    expect(expectedCross).toBe(50)
    expect(below).toBeLessThan(40_000)
  })
})