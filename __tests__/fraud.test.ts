import { describe, it, expect } from "vitest"
import {
  velocityRule, amountZScoreRule, newRecipientRule, newDeviceRule, runFraudRules,
} from "../src/lib/fraud"

const NOW = new Date("2026-08-22T12:00:00Z")
const minsAgo = (m: number) => new Date(NOW.getTime() - m * 60000)

describe("Rule 1 — velocity", () => {
  const burst = (n: number) => Array.from({ length: n }, (_, i) => minsAgo(i * 0.5))

  it("flags at threshold (10 txns in 10 min)", () => {
    const f = velocityRule(burst(10), NOW)
    expect(f).not.toBeNull()
    expect(f!.rule).toBe("VELOCITY")
    expect(f!.severity).toBe("MEDIUM")
    expect(f!.reason).toContain("10 transactions")
  })

  it("clears below threshold", () => {
    expect(velocityRule(burst(9), NOW)).toBeNull()
  })

  it("ignores txns outside the rolling window", () => {
    const old = Array.from({ length: 15 }, (_, i) => minsAgo(60 + i)) // all >1h ago
    expect(velocityRule(old, NOW)).toBeNull()
  })
})

describe("Rule 2 — amount z-score", () => {
  // Uniform-ish small debits: mean ≈ 500, σ ≈ ~100
  const hist = [450, 480, 520, 500, 550, 470, 530, 495]

  it("needs at least 5 data points before judging", () => {
    expect(amountZScoreRule(90000, hist.slice(0, 4))).toBeNull()
  })

  it("skips perfectly uniform history (σ = 0)", () => {
    expect(amountZScoreRule(90000, [100, 100, 100, 100, 100])).toBeNull()
  })

  it("flags a 3σ+ outlier with the computed deviation in the reason", () => {
    const f = amountZScoreRule(50000, hist)
    expect(f).not.toBeNull()
    expect(f!.rule).toBe("AMOUNT_ZSCORE")
    expect(f!.severity).toBe("HIGH")
    expect(f!.reason).toMatch(/σ away/)
    expect(f!.reason).toContain("50,000")
  })

  it("passes amounts inside the normal band", () => {
    // hist mean ≈ 499, σ ≈ 31 → 550 is only ~1.6σ — comfortably inside
    expect(amountZScoreRule(550, hist)).toBeNull()
  })
})

describe("Rule 3 — new recipient above ₹50k", () => {
  it("flags never-paid recipients at/above threshold", () => {
    const f = newRecipientRule(null, 80000)
    expect(f).not.toBeNull()
    expect(f!.rule).toBe("NEW_RECIPIENT")
    expect(f!.severity).toBe("HIGH")
  })

  it("flags recipients known less than 24h", () => {
    const recent = new Date(NOW.getTime() - 2 * 3600000)
    const f = newRecipientRule(recent, 60000, 50000, NOW)
    expect(f).not.toBeNull()
    expect(f!.reason).toContain("2.0h ago")
  })

  it("clears recipients older than 24h even at high amounts", () => {
    const old = new Date(NOW.getTime() - 72 * 3600000)
    expect(newRecipientRule(old, 60000, 50000, NOW)).toBeNull()
  })

  it("small amounts to brand-new recipients are not flagged", () => {
    expect(newRecipientRule(null, 999)).toBeNull()
  })
})

describe("Rule 4 — new device + high value", () => {
  it("flags unknown device with ≥₹25k transfer", () => {
    const f = newDeviceRule(["dev-a", "dev-b"], "dev-unknown-xyz", 30000)
    expect(f).not.toBeNull()
    expect(f!.severity).toBe("HIGH")
    expect(f!.reason).toContain("unrecognized device")
  })

  it("known device passes at same amount", () => {
    expect(newDeviceRule(["dev-a"], "dev-a", 30000)).toBeNull()
  })

  it("unknown device with small transfer is not flagged", () => {
    expect(newDeviceRule([], "dev-new", 500)).toBeNull()
  })

  it("no session device info → cannot judge → no flag", () => {
    expect(newDeviceRule(["dev-a"], null, 30000)).toBeNull()
  })
})

describe("runFraudRules aggregator", () => {
  it("returns every simultaneously-triggered flag", () => {
    const r = runFraudRules({
      txnTimestamps: burst(10),
      amount: 90000,
      historicalAmounts: [450, 480, 520, 500, 550],
      recipientFirstSeenAt: null,
      knownDeviceIds: ["dev-a"],
      currentDeviceId: "dev-unknown",
      now: NOW,
    })
    const rules = r.map((f) => f.rule)
    expect(rules).toContain("VELOCITY")
    expect(rules).toContain("AMOUNT_ZSCORE")
    expect(rules).toContain("NEW_RECIPIENT")
    expect(rules).toContain("NEW_DEVICE_HIGH_VALUE")
    expect(r.every((f) => f.reason.length > 20)).toBe(true) // every flag is explainable
  })

  it("returns empty for a boringly normal transaction", () => {
    const r = runFraudRules({
      txnTimestamps: [minsAgo(120)],
      amount: 520,
      historicalAmounts: [450, 480, 520, 500, 550],
      recipientFirstSeenAt: minsAgo(4000),
      knownDeviceIds: ["dev-a"],
      currentDeviceId: "dev-a",
      now: NOW,
    })
    expect(r).toHaveLength(0)
  })

  function burst(n: number) {
    return Array.from({ length: n }, (_, i) => minsAgo(i * 0.5))
  }
})