import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * ── Account Aggregator consent layer — SIMULATION (P15) ─────────────────────
 * Models India's Sahamati/RBI AA framework: the USER approves a scoped,
 * time-bound consent; a simulated FIU then "pulls" synthetic external data;
 * consent is revocable at any time. The workflow fidelity is the deliverable.
 */

const VALID_SCOPES = ["balances", "transactions", "deposits"]

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const consents = await prisma.aaConsent.findMany({
    where: { userId: p.userId },
    orderBy: { approvedAt: "desc" },
  })
  const active = consents.find((c) => c.status === "ACTIVE" && (!c.revokedAt))
  return NextResponse.json({
    consents,
    active: active
      ? {
          scopes: active.dataScopes.split(","),
          expiresAt: new Date(active.approvedAt.getTime() + active.durationDays * 86400000),
          externalAccounts: active.syntheticData ? JSON.parse(active.syntheticData) : [],
        }
      : null,
  })
}

/** POST — approve a consent (scope + duration), then simulate the data pull. */
export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json()
    const scopes: string[] = Array.isArray(body.scopes) ? body.scopes.filter((s: string) => VALID_SCOPES.includes(s)) : []
    const durationDays = Math.max(1, Math.min(365, parseInt(body.durationDays, 10) || 90))
    if (scopes.length === 0) return NextResponse.json({ error: "Select at least one data scope" }, { status: 400 })

    // Revoke any previous ACTIVE consent (one live consent per user)
    await prisma.aaConsent.updateMany({
      where: { userId: p.userId, status: "ACTIVE" },
      data: { status: "REVOKED", revokedAt: new Date() },
    })

    // Simulated FIU pull: deterministic synthetic external accounts
    const synthetic: Record<string, unknown>[] = []
    if (scopes.includes("balances")) {
      synthetic.push(
        { bankName: "Simulated Bank A", type: "SAVINGS", balance: 84213.45 },
        { bankName: "Simulated NBFC B", type: "LOAN", outstanding: 154000 }
      )
    }
    if (scopes.includes("transactions")) {
      synthetic.push({ bankName: "Simulated Bank A", type: "TRANSACTION_SUMMARY", monthlyInflow: 82000, monthlyOutflow: 61000 })
    }

    const consent = await prisma.aaConsent.create({
      data: {
        userId: p.userId,
        dataScopes: scopes.join(","),
        durationDays,
        status: "ACTIVE",
        syntheticData: JSON.stringify(synthetic),
      },
    })
    return NextResponse.json({ consent, pulledAccounts: synthetic.length }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Consent approval failed" }, { status: 500 })
  }
}

/** PATCH — revoke anytime. */
export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json()
    const r = await prisma.aaConsent.updateMany({
      where: { id: String(body.id), userId: p.userId, status: "ACTIVE" },
      data: { status: "REVOKED", revokedAt: new Date() },
    })
    if (r.count === 0) return NextResponse.json({ error: "Active consent not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Revoke failed" }, { status: 500 })
  }
}