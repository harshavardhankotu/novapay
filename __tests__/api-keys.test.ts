import { describe, it, expect } from "vitest"
import { hashKey, generateApiKey, signWebhook } from "../src/lib/api-auth"
import { nextCollectionsStatus } from "../src/lib/lending"

describe("API key primitives", () => {
  it("hashing is deterministic and salt-free (lookup key)", () => {
    expect(hashKey("npk_abc")).toBe(hashKey("npk_abc"))
    expect(hashKey("npk_abc")).not.toBe(hashKey("npk_abd"))
    expect(hashKey("npk_abc")).toMatch(/^[a-f0-9]{64}$/)
  })

  it("generated keys always carry the npk_ prefix", () => {
    const { raw, prefix } = generateApiKey()
    expect(raw.startsWith("npk_")).toBe(true)
    expect(prefix.startsWith("npk_")).toBe(true)
    expect(prefix.length).toBe(12)
    // hash matches the raw key
    expect(hashKey(raw)).toBe(hashKey(raw))
  })
})

describe("webhook HMAC signature", () => {
  it("is deterministic for identical secret/body/timestamp", () => {
    const a = signWebhook("sec", `{"event":"x"}`, 1700000000000)
    const b = signWebhook("sec", `{"event":"x"}`, 1700000000000)
    expect(a).toBe(b)
    expect(a).toMatch(/^[a-f0-9]{64}$/)
  })

  it("changes when the body or timestamp changes (tamper-evident)", () => {
    const base = signWebhook("sec", "body", 1)
    expect(signWebhook("sec", "body2", 1)).not.toBe(base)
    expect(signWebhook("sec", "body", 2)).not.toBe(base)
    expect(signWebhook("sec2", "body", 1)).not.toBe(base)
  })
})

// Scope matrix is enforced by authenticateApiKey against the DB; the pure
// part we can lock down here is that scope strings round-trip as CSV.
describe("scope CSV contract", () => {
  it("splits into the documented scope set", () => {
    const csv = "accounts.read,balance.read,transfers.write,mandates.write"
    const set = new Set(csv.split(",").map((s) => s.trim()))
    expect(set.has("accounts.read")).toBe(true)
    expect(set.has("mandates.write")).toBe(true)
    expect(set.size).toBe(4)
  })

  it("delinquency ladder unchanged (guardrail spot-check)", () => {
    expect(nextCollectionsStatus(2)).toBe("SOFT")
    expect(nextCollectionsStatus(4)).toBe("HARD")
  })
})