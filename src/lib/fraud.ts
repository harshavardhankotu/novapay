/**
 * ── Fraud Radar rules (P6) ───────────────────────────────────────────────────
 * Four explainable, PURE rules. Every flag carries a plain-language reason so
 * compliance (and the user) always sees WHY it fired.
 */

export interface FraudFlag {
  rule: string
  reason: string
  severity: "MEDIUM" | "HIGH"
}

const round2 = (x: number) => Math.round(x * 100) / 100

/** Rule 1 — Velocity: more than `maxTxns` debits inside a rolling window. */
export function velocityRule(
  txnTimestamps: Date[],
  now: Date = new Date(),
  maxTxns = 10,
  windowMinutes = 10
): FraudFlag | null {
  const windowStart = now.getTime() - windowMinutes * 60000
  const count = txnTimestamps.filter((t) => t.getTime() >= windowStart && t.getTime() <= now.getTime()).length
  if (count >= maxTxns) {
    return {
      rule: "VELOCITY",
      severity: "MEDIUM",
      reason: `${count} transactions in the last ${windowMinutes} minutes (threshold ${maxTxns}). Rapid-fire activity can indicate automated fraud testing.`,
    }
  }
  return null
}

/** Rule 2 — Amount z-score vs this account's own historical debit distribution. */
export function amountZScoreRule(
  amount: number,
  historicalAmounts: number[],
  zThreshold = 3
): FraudFlag | null {
  if (historicalAmounts.length < 5) return null // need a baseline before judging
  const mean = historicalAmounts.reduce((a, b) => a + b, 0) / historicalAmounts.length
  const variance =
    historicalAmounts.reduce((a, b) => a + (b - mean) ** 2, 0) / historicalAmounts.length
  const sigma = Math.sqrt(variance)
  if (sigma === 0) return null // perfectly uniform history — nothing to compare
  const z = (amount - mean) / sigma
  if (Math.abs(z) >= zThreshold) {
    return {
      rule: "AMOUNT_ZSCORE",
      severity: "HIGH",
      reason: `This transaction of ₹${amount.toLocaleString("en-IN")} is ${z.toFixed(1)}σ away from your usual pattern (avg ₹${round2(mean).toLocaleString("en-IN")}, σ ₹${round2(sigma).toLocaleString("en-IN")}).`,
    }
  }
  return null
}

/** Rule 3 — New recipient above threshold (first payment <24h ago or never). */
export function newRecipientRule(
  recipientFirstSeenAt: Date | null,
  amount: number,
  threshold = 50_000,
  now: Date = new Date()
): FraudFlag | null {
  if (amount < threshold) return null
  if (!recipientFirstSeenAt) {
    return {
      rule: "NEW_RECIPIENT",
      severity: "HIGH",
      reason: `₹${amount.toLocaleString("en-IN")} sent to a recipient you have never paid before (first-payment threshold ₹${threshold.toLocaleString("en-IN")}).`,
    }
  }
  const hoursKnown = (now.getTime() - recipientFirstSeenAt.getTime()) / 3600000
  if (hoursKnown < 24) {
    return {
      rule: "NEW_RECIPIENT",
      severity: "HIGH",
      reason: `₹${amount.toLocaleString("en-IN")} sent to a recipient added only ${hoursKnown.toFixed(1)}h ago. Banks impose a cooling period for exactly this risk.`,
    }
  }
  return null
}

/** Rule 4 — Unknown device combined with a high-value transfer. */
export function newDeviceRule(
  knownDeviceIds: string[],
  currentDeviceId: string | null,
  amount: number,
  threshold = 25_000
): FraudFlag | null {
  if (!currentDeviceId) return null // no session data — cannot judge (by design)
  if (amount < threshold) return null
  if (!knownDeviceIds.includes(currentDeviceId)) {
    return {
      rule: "NEW_DEVICE_HIGH_VALUE",
      severity: "HIGH",
      reason: `₹${amount.toLocaleString("en-IN")} transferred from an unrecognized device ("${currentDeviceId.slice(0, 12)}…"). High value + new device is our strongest fraud signal.`,
    }
  }
  return null
}

/** Aggregate runner — returns every triggered flag. */
export function runFraudRules(ctx: {
  txnTimestamps: Date[]
  amount: number
  historicalAmounts: number[]
  recipientFirstSeenAt: Date | null
  knownDeviceIds: string[]
  currentDeviceId: string | null
  now?: Date
}): FraudFlag[] {
  const flags: FraudFlag[] = []
  const now = ctx.now ?? new Date()

  const v = velocityRule(ctx.txnTimestamps, now)
  if (v) flags.push(v)

  const z = amountZScoreRule(ctx.amount, ctx.historicalAmounts)
  if (z) flags.push(z)

  const nr = newRecipientRule(ctx.recipientFirstSeenAt, ctx.amount, 50_000, now)
  if (nr) flags.push(nr)

  const nd = newDeviceRule(ctx.knownDeviceIds, ctx.currentDeviceId, ctx.amount)
  if (nd) flags.push(nd)

  return flags
}