import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/** GET — cards + control fields + recent swipe attempts. */
export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [cards, attempts] = await Promise.all([
    prisma.card.findMany({
      where: { account: { userId: p.userId } },
      include: { account: { select: { currency: true } } },
    }),
    prisma.swipeAttempt.findMany({ where: { userId: p.userId }, orderBy: { createdAt: "desc" }, take: 15 }),
  ])

  return NextResponse.json({
    cards: cards.map((c) => ({ ...c, cvv: "***" })),
    recentAttempts: attempts,
  })
}

/** POST — issue a new card. { type, network } */
export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { type, network } = await request.json()
    const account = await prisma.account.findFirst({
      where: { userId: p.userId, isActive: true },
      orderBy: { createdAt: "asc" },
    })
    if (!account) return NextResponse.json({ error: "No active account found" }, { status: 400 })

    const isPhysical = type === "PHYSICAL"
    const card = await prisma.card.create({
      data: {
        accountId: account.id,
        type: type || "VIRTUAL",
        network: network || "VISA",
        lastFour: Math.floor(1000 + Math.random() * 9000).toString(),
        expiryMonth: new Date().getMonth() + 1,
        expiryYear: new Date().getFullYear() + 3,
        cvv: Math.floor(100 + Math.random() * 900).toString(),
        dailyLimit: 100000,
        monthlyLimit: 500000,
        ...(isPhysical ? { dispatchStatus: "CONFIRMING_ADDRESS" } : {}),
      },
    })
    return NextResponse.json({ ...card, cvv: "***" })
  } catch {
    return NextResponse.json({ error: "Card issuance failed" }, { status: 500 })
  }
}

/**
 * PATCH — card controls.
 * { id, action?: freeze|unfreeze, dailyLimit?, perTxLimit?,
 *   internationalEnabled?, blockedMccCategories?, confirmDispatchAddress? }
 */
export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const card = await prisma.card.findFirst({
      where: { id: String(body.id), account: { userId: p.userId } },
    })
    if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 })

    const update: Record<string, unknown> = {}
    if (body.action === "freeze") update.status = "FROZEN"
    if (body.action === "unfreeze") update.status = "ACTIVE"
    if (body.dailyLimit != null && Number.isFinite(Number(body.dailyLimit))) update.dailyLimit = Number(body.dailyLimit)
    if (body.perTxLimit != null && Number.isFinite(Number(body.perTxLimit)) && Number(body.perTxLimit) > 0) update.perTxLimit = Number(body.perTxLimit)
    if (typeof body.internationalEnabled === "boolean") update.internationalEnabled = body.internationalEnabled
    if (typeof body.blockedMccCategories === "string") update.blockedMccCategories = body.blockedMccCategories

    // Physical-card issuance workflow step: confirm address → dispatched
    if (
      card.type === "PHYSICAL" &&
      !card.dispatchStatus &&
      typeof body.confirmDispatchAddress === "string" &&
      body.confirmDispatchAddress.trim().length > 5
    ) {
      update.deliveryAddress = body.confirmDispatchAddress.trim().slice(0, 200)
      update.dispatchStatus = "DISPATCHED" // simulated courier handoff
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
    }

    const updated = await prisma.card.update({ where: { id: card.id }, data: update })
    return NextResponse.json({ ...updated, cvv: "***" })
  } catch {
    return NextResponse.json({ error: "Card update failed" }, { status: 500 })
  }
}