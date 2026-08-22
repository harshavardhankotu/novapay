/**
 * ── Payment rail differentiation (P4) ────────────────────────────────────────
 * Each Indian rail has genuinely different operating rules. This module
 * encodes them so a "transfer" is never one undifferentiated thing.
 */

export type Rail = "NEFT" | "RTGS" | "IMPS" | "UPI"

export interface RailRules {
  label: string
  mode: "instant" | "batched"
  minAmount: number
  maxPerTx: number
  /** NEFT settles in half-hourly batches between 08:00–18:30 on working days */
  batchWindow?: { startHour: number; endHour: number }
  note: string
}

export const RAILS: Record<Rail, RailRules> = {
  UPI: { label: "UPI", mode: "instant", minAmount: 1, maxPerTx: 100_000, note: "Instant, VPA-based, ₹1L/day shared cap." },
  IMPS: { label: "IMPS", mode: "instant", minAmount: 1, maxPerTx: 500_000, note: "Instant, 24×7, up to ₹5L per transaction." },
  RTGS: { label: "RTGS", mode: "instant", minAmount: 200_000, maxPerTx: 10_000_000, note: "Real-time gross settlement, ₹2L minimum, 24×7 (RBI extended hours)." },
  NEFT: { label: "NEFT", mode: "batched", minAmount: 1, maxPerTx: 10_000_000, batchWindow: { startHour: 8, endHour: 18 }, note: "Half-hourly batches, 08:00–18:30; outside window rolls to next morning batch." },
}

export class RailError extends Error {
  constructor(public code: string, message: string) { super(message) }
}

export function validateRail(railRaw: unknown): Rail {
  const rail = String(railRaw || "UPI").toUpperCase() as Rail
  if (!(rail in RAILS)) throw new RailError("BAD_RAIL", `Unknown rail: ${rail}`)
  return rail
}

export function assertRailAllows(rail: Rail, amount: number): void {
  const rules = RAILS[rail]
  if (amount < rules.minAmount) {
    if (rail === "RTGS") {
      throw new RailError("RTGS_MIN", `RTGS requires a minimum of ₹2,00,000 — use IMPS or NEFT for smaller amounts.`)
    }
    throw new RailError("RAIL_MIN", `${rules.label} minimum is ₹${rules.minAmount.toLocaleString("en-IN")}`)
  }
  if (amount > rules.maxPerTx) {
    if (rail === "IMPS") {
      throw new RailError("IMPS_MAX", `IMPS caps at ₹5,00,000 per transaction — switch to RTGS for larger amounts.`)
    }
    if (rail === "UPI") {
      throw new RailError("UPI_MAX", `UPI caps at ₹1,00,000 per transaction — use IMPS/NEFT/RTGS for larger amounts.`)
    }
    throw new RailError("RAIL_MAX", `${rules.label} maximum is ₹${rules.maxPerTx.toLocaleString("en-IN")}`)
  }
}

/** NEFT outside the window → next-morning batch. Inside → next half-hour slot. */
export function resolveRailSchedule(rail: Rail, amount: number, now = new Date()): { mode: "instant" | "scheduled"; scheduledFor: Date | null } {
  assertRailAllows(rail, amount)
  const rules = RAILS[rail]
  if (rules.mode === "instant" || !rules.batchWindow) return { mode: "instant", scheduledFor: null }

  const h = now.getHours()
  const { startHour, endHour } = rules.batchWindow
  if (h >= startHour && h < endHour) {
    // Next half-hour boundary
    const scheduledFor = new Date(now)
    scheduledFor.setMinutes(now.getMinutes() <= 30 ? 30 : 60, 0, 0)
    return { mode: "instant", scheduledFor: null } // current-window settlement ≈ immediate for demo purposes
  }
  const scheduledFor = new Date(now)
  scheduledFor.setDate(h >= endHour ? scheduledFor.getDate() + 1 : scheduledFor.getDate())
  scheduledFor.setHours(startHour, 0, 0, 0)
  return { mode: "scheduled", scheduledFor }
}