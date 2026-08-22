import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * SIMULATED missed-call/IVR banking (P13) — a text state machine standing in
 * for the *99#/toll-free flows Indian banks offer for financial inclusion.
 * No telephony: sessions are web-driven and clearly labelled.
 */

const sessions = new Map<string, {
  userId: string
  state: "MENU" | "BLOCKED_DONE"
}>()

export async function POST(request: Request) {
  const t = getTokenFromCookies(request)
  const p = t ? verifyToken(t) : null
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const sessionId = String(body.sessionId || `ivr_${p.userId}`)
  const input = String(body.input ?? "").trim()

  let session = sessions.get(sessionId)
  if (!session || session.userId !== p.userId) {
    session = { userId: p.userId, state: "MENU" }
    sessions.set(sessionId, session)

    // First contact → menu
    return NextResponse.json({
      sessionId,
      state: "MENU",
      reply:
        `Welcome to NovaPay missed-call banking (SIMULATION).\n` +
        `1 - Balance\n2 - Mini statement\n3 - Block all cards`,
    })
  }

  const accounts = await prisma.account.findMany({ where: { userId: p.userId, isActive: true } })
  const balance = accounts.reduce((s, a) => s + a.balance, 0)

  switch (input) {
    case "1": {
      return NextResponse.json({
        sessionId,
        state: "MENU",
        reply: `Total balance across ${accounts.length} account(s): ₹${balance.toLocaleString("en-IN")}`,
      })
    }
    case "2": {
      const txns = await prisma.transaction.findMany({
        where: { accountId: { in: accounts.map((a) => a.id) } },
        orderBy: { timestamp: "desc" },
        take: 3,
      })
      return NextResponse.json({
        sessionId,
        state: "MENU",
        reply:
          txns.length === 0
            ? "No recent transactions."
            : txns.map((x) => `${new Date(x.timestamp).toLocaleDateString("en-IN")} · ${x.type} ₹${Math.abs(x.amount).toLocaleString("en-IN")} · ${x.category}`).join("\n"),
      })
    }
    case "3": {
      const r = await prisma.card.updateMany({
        where: { account: { userId: p.userId }, status: "ACTIVE" },
        data: { status: "FROZEN" },
      })
      await prisma.auditLog.create({
        data: { userId: p.userId, action: "CARDS_BLOCKED_IVR", details: `${r.count} card(s) frozen via IVR simulation`, device: "IVR Simulator", ip: "session" },
      }).catch(() => {})
      return NextResponse.json({ sessionId, state: "MENU", reply: `${r.count} card(s) frozen.` })
    }
    default:
      return NextResponse.json({
        sessionId,
        state: "MENU",
        reply: "Invalid option.\n1 - Balance\n2 - Mini statement\n3 - Block all cards",
      })
  }
}