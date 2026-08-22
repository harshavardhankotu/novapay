import { describe, it, expect } from "vitest"
import { validateRail, assertRailAllows, resolveRailSchedule, RailError, RAILS } from "../src/lib/rails"

describe("rail rules encode real operating constraints", () => {
  it("RTGS enforces the ₹2L minimum", () => {
    expect(() => assertRailAllows("RTGS", 199999)).toThrow(RailError)
    try { assertRailAllows("RTGS", 199999) } catch (e: any) {
      expect(e.code).toBe("RTGS_MIN")
      expect(e.message).toContain("IMPS or NEFT")
    }
    expect(() => assertRailAllows("RTGS", 200000)).not.toThrow()
  })

  it("IMPS caps at ₹5L and suggests RTGS", () => {
    try { assertRailAllows("IMPS", 500001); throw new Error("should have thrown") } catch (e: any) {
      expect(e.code).toBe("IMPS_MAX")
    }
    expect(() => assertRailAllows("IMPS", 500000)).not.toThrow()
  })

  it("UPI caps at ₹1L", () => {
    try { assertRailAllows("UPI", 100001); throw new Error("should have thrown") } catch (e: any) {
      expect(e.code).toBe("UPI_MAX")
    }
  })
})

describe("NEFT batch windows", () => {
  it("inside window → immediate settlement", () => {
    const inside = new Date(); inside.setHours(14, 10, 0, 0)
    const r = resolveRailSchedule("NEFT", 25000, inside)
    expect(r.mode).toBe("instant")
    expect(r.scheduledFor).toBeNull()
  })

  it("after 18:30 → next-morning batch", () => {
    const evening = new Date(); evening.setHours(21, 0, 0, 0)
    const r = resolveRailSchedule("NEFT", 25000, evening)
    expect(r.mode).toBe("scheduled")
    expect(r.scheduledFor!.getHours()).toBe(8)
    expect(r.scheduledFor!.getDate()).toBe(evening.getDate() + 1)
  })

  it("before 08:00 → same-day first batch", () => {
    const early = new Date(); early.setHours(6, 30, 0, 0)
    const r = resolveRailSchedule("NEFT", 25000, early)
    expect(r.mode).toBe("scheduled")
    expect(r.scheduledFor!.getHours()).toBe(8)
    expect(r.scheduledFor!.getDate()).toBe(early.getDate())
  })

  it("instant rails never schedule regardless of time", () => {
    const night = new Date(); night.setHours(23, 59, 0, 0)
    for (const rail of ["UPI", "IMPS", "RTGS"] as const) {
      const r = resolveRailSchedule(rail, RAILS[rail].minAmount, night)
      expect(r.mode).toBe("instant")
    }
  })
})

describe("validateRail", () => {
  it("defaults to UPI and rejects unknown rails", () => {
    expect(validateRail(undefined)).toBe("UPI")
    expect(() => validateRail("TELEGRAPH")).toThrow(RailError)
  })
})