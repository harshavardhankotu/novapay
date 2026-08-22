import { describe, it, expect } from "vitest"
import { projectBalance } from "../src/lib/cashflow"

const START = new Date("2026-09-01T00:00:00Z")
const day = (n: number) => new Date(START.getTime() + n * 86400000)

describe("projectBalance", () => {
  it("detects the exact shortfall date and its dominant cause", () => {
    // Start ₹5,000. Big EMI lands BEFORE the next salary → guaranteed dip.
    const r = projectBalance({
      startBalance: 5000,
      startDate: START,
      horizonDays: 30,
      recurringIncome: [{ label: "Salary", amount: 30000, nextDate: day(20) }],
      scheduledDebits: [{ label: "Home Loan EMI", amount: 12000, dueDate: day(3) }],
      weekdaySpend: [50, 50, 50, 50, 50, 50, 50],
    })

    expect(r.shortfall).not.toBeNull()
    expect(r.shortfall!.date.getTime()).toBe(day(3).getTime())
    expect(r.shortfall!.cause).toContain("Home Loan EMI")
    expect(r.shortfall!.closing).toBeLessThan(0)
    // Salary on day 20 pulls it back above zero
    expect(r.days[20].closing).toBeGreaterThan(0)
  })

  it("no shortfall when income covers all outflows", () => {
    const r = projectBalance({
      startBalance: 20000,
      startDate: START,
      horizonDays: 30,
      recurringIncome: [{ label: "Salary", amount: 80000, nextDate: day(3) }],
      scheduledDebits: [{ label: "Rent", amount: 25000, dueDate: day(6) }],
      weekdaySpend: [500, 500, 500, 500, 500, 900, 900], // ≈ ₹5,400/wk
    })
    expect(r.shortfall).toBeNull()
    expect(r.days[r.days.length - 1].closing).toBeGreaterThan(0)
  })

  it("recurring income repeats monthly across a long horizon", () => {
    const r = projectBalance({
      startBalance: 0,
      startDate: START,
      horizonDays: 60,
      recurringIncome: [{ label: "Salary", amount: 50000, nextDate: day(2) }],
      scheduledDebits: [],
      weekdaySpend: [0, 0, 0, 0, 0, 0, 0],
    })
    const salaryDays = r.days.filter((d) => d.inflow === 50000)
    expect(salaryDays.length).toBe(2)
  })

  it("applies each weekday's own estimate to the right calendar day", () => {
    const r = projectBalance({
      startBalance: 0,
      startDate: START,
      horizonDays: 7,
      recurringIncome: [],
      scheduledDebits: [],
      weekdaySpend: [111, 222, 333, 444, 555, 666, 777],
    })
    // Whatever weekday each projected date falls on, its outflow must equal
    // the pattern value indexed by THAT day's real getDay().
    r.days.forEach((d) => {
      expect(d.outflow).toBe([111, 222, 333, 444, 555, 666, 777][d.date.getDay()])
    })
  })

  it("closing balance chains correctly day over day", () => {
    const flat = new Array(7).fill(100) // uniform ₹100/day removes weekday ambiguity
    const r = projectBalance({
      startBalance: 1000,
      startDate: START,
      horizonDays: 3,
      recurringIncome: [],
      scheduledDebits: [],
      weekdaySpend: flat,
    })
    expect(r.days[0].closing).toBe(900)
    expect(r.days[1].closing).toBe(800)
    expect(r.days[2].closing).toBe(700)
  })
})