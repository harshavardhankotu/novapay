/**
 * ── Predictive cash-flow calendar (P7) ───────────────────────────────────────
 * Pure forward-projection engine: starting balance + known future inflows
 * (recurring income) − known scheduled outflows (EMIs/mandates/SIs) − a
 * weekday-pattern estimate of discretionary spending, projected day by day.
 */

export interface ScheduledOutflow {
  label: string
  amount: number
  dueDate: Date
}

export interface RecurringInflow {
  label: string
  amount: number
  /** Next occurrence; subsequent ones assumed monthly. */
  nextDate: Date
}

export interface ProjectionDay {
  date: Date
  inflow: number
  outflow: number
  closing: number
  events: string[]
}

export interface Shortfall {
  date: Date
  closing: number
  cause: string
}

export interface ProjectionResult {
  days: ProjectionDay[]
  shortfall: Shortfall | null
}

const DAY = 86400000

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/**
 * Projects day-by-day balances for `horizonDays`.
 * `weekdaySpend` = 7 averages (Sun..Sat) of discretionary spend.
 */
export function projectBalance(opts: {
  startBalance: number
  startDate: Date
  horizonDays: number
  recurringIncome: RecurringInflow[]
  scheduledDebits: ScheduledOutflow[]
  weekdaySpend: number[]
}): ProjectionResult {
  const { startBalance, startDate, horizonDays, recurringIncome, scheduledDebits, weekdaySpend } = opts

  // Normalise every scheduled item onto absolute dates across the horizon
  type Event = { label: string; amount: number; date: Date }
  const inflowEvents: Event[] = []
  for (const inc of recurringIncome) {
    let d = new Date(inc.nextDate)
    let guard = 0
    while (d.getTime() <= startDate.getTime() + horizonDays * DAY && guard < 12) {
      if (d.getTime() >= startDate.getTime()) {
        inflowEvents.push({ label: inc.label, amount: inc.amount, date: new Date(d) })
      }
      d = new Date(d.getTime() + 30 * DAY)
      guard++
    }
  }

  const outflowEvents: Event[] = scheduledDebits
    .filter((s) => s.dueDate.getTime() >= startDate.getTime() && s.dueDate.getTime() <= startDate.getTime() + horizonDays * DAY)
    .map((s) => ({ label: s.label, amount: s.amount, date: new Date(s.dueDate) }))

  const days: ProjectionDay[] = []
  let closing = Math.round(startBalance * 100) / 100
  let shortfall: Shortfall | null = null

  for (let i = 0; i < horizonDays; i++) {
    const date = new Date(startDate.getTime() + i * DAY)

    const todaysIn = inflowEvents.filter((e) => sameDay(e.date, date))
    const todaysOut = outflowEvents.filter((e) => sameDay(e.date, date))

    const inflow = round2(todaysIn.reduce((s, e) => s + e.amount, 0))
    const events = [
      ...todaysIn.map((e) => `+ ${e.label} ₹${e.amount.toLocaleString("en-IN")}`),
    ]

    let outflow = round2(todaysOut.reduce((s, e) => s + e.amount, 0))
    for (const e of todaysOut) events.push(`− ${e.label} ₹${e.amount.toLocaleString("en-IN")}`)

    // Discretionary estimate by weekday
    const wdEstimate = round2(weekdaySpend[date.getDay()] ?? 0)
    outflow = round2(outflow + wdEstimate)
    if (wdEstimate > 0) events.push(`− typical ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]} spending ₹${wdEstimate.toLocaleString("en-IN")}`)

    closing = round2(closing + inflow - outflow)
    days.push({ date, inflow, outflow, closing, events })

    if (!shortfall && closing < 0) {
      const biggest = [...todaysOut].sort((a, b) => b.amount - a.amount)[0]
      shortfall = {
        date,
        closing,
        cause: biggest
          ? `Balance goes negative on ${date.toLocaleDateString("en-IN")} — driven mainly by "${biggest.label}" (₹${biggest.amount.toLocaleString("en-IN")}).`
          : `Balance drifts negative on ${date.toLocaleDateString("en-IN")} through routine spending.`,
      }
    }
  }

  return { days, shortfall }
}

function round2(x: number): number {
  return Math.round(x * 100) / 100
}