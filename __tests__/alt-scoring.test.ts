import { describe, it, expect } from "vitest"
import { computeAltScore, THIN_FILE_TXN_THRESHOLD, type AltScoreInputs } from "../src/lib/alt-scoring"

const base: AltScoreInputs = {
  txnCount90d: 5,
  activeDays90: 40,
  recurringBillsCompleted: 4,
  emiRepaidCount: 6,
  emiMissedCount: 0,
  incomeVarianceReported: 18000,
}

describe("Persona 1 — thin-file GOOD payer", () => {
  const r = computeAltScore(base)

  it("is detected as thin file", () => {
    expect(r.thinFile).toBe(true)
    expect(base.txnCount90d).toBeLessThan(THIN_FILE_TXN_THRESHOLD)
  })

  it("approves with reasoning citing consistency and clean EMI record", () => {
    expect(r.decision).toBe("APPROVE")
    expect(r.reasons.join(" ")).toContain("recurring bills paid on schedule")
    expect(r.reasons.join(" ")).toContain("without a miss")
  })
})

describe("Persona 2 — thin-file IRREGULAR-INCOME payer (gig-style)", () => {
  const inputs = { ...base, incomeVarianceReported: 42000 }
  const r = computeAltScore(inputs)

  it("still approves despite high income variance", () => {
    expect(r.decision).toBe("APPROVE")
  })

  it("explicitly states variance was NOT penalised", () => {
    const joined = r.reasons.join(" ")
    expect(joined).toContain("NOT counted against you")
    expect(joined).toContain("42,000")
  })

  it("score is identical to persona 1 (variance is score-blind)", () => {
    // Only the variance field differs between the two personas
    expect(r.composite).toBe(computeAltScore(base).composite)
  })
})

describe("Persona 3 — DETERIORATING payer", () => {
  const inputs: AltScoreInputs = {
    ...base,
    recurringBillsCompleted: 0,
    emiRepaidCount: 2,
    emiMissedCount: 3,
    activeDays90: 6,
  }
  const r = computeAltScore(inputs)

  it("declines a missed-payment-heavy profile", () => {
    expect(r.decision).toBe("DECLINE")
  })

  it("reasoning names the actual driving signal (missed EMIs)", () => {
    const joined = r.reasons.join(" ")
    expect(joined).toContain("missed repayments push this below")
  })

  it("scores strictly below both approving personas", () => {
    expect(r.composite).toBeLessThan(computeAltScore(base).composite)
    expect(r.composite).toBeLessThan(40)
  })
})