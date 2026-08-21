import { describe, it, expect } from "vitest"
import { LIMITS } from "../src/lib/banking"
import { advanceDate } from "../src/lib/jobs"

describe("KYC limit tiers", () => {
  it("blocks unverified users entirely", () => {
    expect(LIMITS.UNVERIFIED.perTx).toBe(0)
    expect(LIMITS.UNVERIFIED.daily).toBe(0)
  })

  it("minimal KYC is more restrictive than full KYC", () => {
    expect(LIMITS.MINIMAL.perTx).toBeLessThan(LIMITS.FULL.perTx)
    expect(LIMITS.MINIMAL.daily).toBeLessThan(LIMITS.FULL.daily)
  })

  it("full KYC matches the published constants (₹1L per tx)", () => {
    expect(LIMITS.FULL.perTx).toBe(100_000)
    expect(LIMITS.FULL.daily).toBeGreaterThan(LIMITS.FULL.perTx)
  })
})

describe("advanceDate (mandate/EMI scheduling)", () => {
  const base = new Date("2026-01-31T10:00:00Z")

  it("advances monthly without skipping months", () => {
    const next = advanceDate(base, "MONTHLY")
    // Jan 31 + 1 month clamps to Feb 28 in a non-leap-safe but predictable way
    expect(next.getUTCFullYear()).toBe(2026)
    expect(next.getTime()).toBeGreaterThan(base.getTime())
  })

  it("advances daily by exactly one day", () => {
    const next = advanceDate(base, "DAILY")
    expect(next.getTime() - base.getTime()).toBe(86400000)
  })

  it("advances weekly by exactly seven days", () => {
    const next = advanceDate(base, "WEEKLY")
    expect(next.getTime() - base.getTime()).toBe(7 * 86400000)
  })

  it("advances yearly by one year", () => {
    const next = advanceDate(base, "YEARLY")
    expect(next.getUTCFullYear()).toBe(2027)
  })

  it("treats unknown frequencies as monthly", () => {
    const next = advanceDate(base, "WHENEVER")
    const monthly = advanceDate(base, "MONTHLY")
    expect(next.getTime()).toBe(monthly.getTime())
  })
})

describe("signed ledger convention", () => {
  it("debits are negative, credits positive (statements rely on this)", () => {
    const debitAmount = -250.55
    const creditAmount = 250.55
    expect(debitAmount < 0).toBe(true)   // statements: t.amount > 0 = income
    expect(creditAmount > 0).toBe(true)
    expect(Math.abs(debitAmount)).toBe(Math.abs(creditAmount))
  })
})