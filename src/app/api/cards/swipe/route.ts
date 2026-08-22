import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { processSwipe, MCC_CATEGORIES } from "@/lib/card-sim"

/**
 * POST /api/cards/swipe — POS/ATM/ONLINE transaction simulation.
 * { cardId, channel, mccCategory, amount, intl }
 */
export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json()
    const amount = Math.round(Number(body.amount) * 100) / 100
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }
    if (typeof body.cardId !== "string") {
      return NextResponse.json({ error: "cardId required" }, { status: 400 })
    }
    const result = await processSwipe(p.userId, {
      cardId: body.cardId,
      channel: ["POS", "ATM", "ONLINE"].includes(body.channel) ? body.channel : "POS",
      mccCategory: MCC_CATEGORIES.includes(body.mccCategory) ? body.mccCategory : "OTHER",
      amount,
      intl: !!body.intl,
    })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Swipe processing failed" }, { status: 500 })
  }
}