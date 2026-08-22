import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"

/**
 * POST /api/v1/mandates — scope: mandates.write
 * { name, amount, frequency, dayOfMonth?, accountId }
 * Creates a NACH-style recurring mandate owned by the key's linked user.
 */
const FREQ = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]

export async function POST(request: Request) {
  const auth = await authenticateApiKey(request, "mandates.write")
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status! })
  const ctx = auth.ctx!

  try {
    const body = await request.json()
    const amount = Math.round(Number(body.amount) * 100) / 100
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }
    const frequency = FREQ.includes(body.frequency) ? body.frequency : "MONTHLY"

    // Account must belong to the key's linked user (scope boundary)
    const account = await prisma.account.findFirst({
      where: { id: String(body.accountId), userId: ctx.userId, isActive: true },
    })
    if (!account) return NextResponse.json({ error: "Account not found for this key's scope" }, { status: 404 })

    const nextRun = new Date(Date.now() + (frequency === "DAILY" ? 86400000 : frequency === "WEEKLY" ? 7 * 86400000 : 30 * 86400000))

    const mandate = await prisma.paymentMandate.create({
      data: {
        userId: ctx.userId,
        name: String(body.name || "API Mandate").slice(0, 60),
        amount,
        frequency,
        accountId: account.id,
        nextRun,
        status: "ACTIVE",
        debitCount: 0,
        umrn: `API${Date.now().toString(36).toUpperCase()}`,
      },
      select: { id: true, name: true, amount: true, frequency: true, status: true, nextRun: true },
    })

    return NextResponse.json(mandate, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Mandate creation failed" }, { status: 500 })
  }
}