import { prisma } from "@/lib/prisma"
import { notify } from "@/lib/banking"

/**
 * ── AML / sanctions screening (P5) ───────────────────────────────────────────
 * SIMULATION: a static embedded watchlist stands in for OFAC/UN/SEBI lists.
 * The workflow is the point: screen at onboarding + on high-value transfers,
 * record hits, and auto-open an STR case for compliance review.
 */

export const WATCHLIST: { name: string; listName: string }[] = [
  { name: "Viktor Malenko", listName: "OFAC-SDN (simulated)" },
  { name: "Chen Wu Holdings", listName: "UN-Sanctions (simulated)" },
  { name: "Al-Rashid Trading", listName: "OFAC-SDN (simulated)" },
  { name: "Pyotr Ivanov", listName: "EU-Consolidated (simulated)" },
  { name: "Golden Lotus Exports", listName: "FATF-HighRisk (simulated)" },
]

export const HIGH_VALUE_TRANSFER_THRESHOLD = 1_000_000 // ₹10L

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim()
}

export interface ScreeningOutcome {
  hit: boolean
  matchedOn?: string
  listName?: string
}

/** Fuzzy-ish containment match against the simulated watchlist. */
export function screenName(name: string): ScreeningOutcome {
  const n = normalize(name)
  if (!n) return { hit: false }
  for (const entry of WATCHLIST) {
    const w = normalize(entry.name)
    if (n.includes(w) || w.includes(n)) {
      return { hit: true, matchedOn: entry.name, listName: entry.listName }
    }
  }
  return { hit: false }
}

/** Record a hit and open an STR case. Never throws. */
export async function recordHitAndOpenCase(
  userId: string,
  triggerRef: string,
  rule: string,
  summary: string,
  outcome: ScreeningOutcome
): Promise<void> {
  try {
    if (outcome.hit) {
      await prisma.screeningHit.create({
        data: { userId, listName: outcome.listName!, matchedOn: outcome.matchedOn! },
      })
    }
    await prisma.strCase.create({
      data: {
        subjectUserId: userId,
        triggerRef,
        rule,
        summary,
        status: "OPEN",
      },
    })
    await notify(userId, "Compliance Review Initiated", "A routine compliance review has been opened on your account activity. No action needed from you.")
  } catch {
    // screening must never break onboarding/transfers
  }
}

/** Onboarding screening — called right after user creation. */
export async function screenOnboarding(userId: string, fullName: string): Promise<void> {
  const outcome = screenName(fullName)
  if (outcome.hit) {
    await recordHitAndOpenCase(
      userId,
      `signup:${userId.slice(-6)}`,
      "AML_ONBOARDING_WATCHLIST",
      `Onboarding name "${fullName}" matched ${outcome.listName} entry "${outcome.matchedOn}".`,
      outcome
    )
  }
}

/** High-value transfer screening — threshold-based case opening. */
export async function screenTransfer(userId: string, amount: number, reference: string, counterparty?: string | null): Promise<void> {
  if (amount < HIGH_VALUE_TRANSFER_THRESHOLD) return
  const nameOutcome = counterparty ? screenName(counterparty) : { hit: false }
  await recordHitAndOpenCase(
    userId,
    reference,
    nameOutcome.hit ? "AML_TRANSFER_WATCHLIST" : "HIGH_VALUE_TRANSFER",
    nameOutcome.hit
      ? `Transfer of ₹${amount.toLocaleString("en-IN")} to watchlisted party "${nameOutcome.matchedOn}" (${nameOutcome.listName}).`
      : `High-value transfer of ₹${amount.toLocaleString("en-IN")} flagged for routine review.`,
    nameOutcome
  )
}