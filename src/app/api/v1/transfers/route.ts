import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"
import { deliverWebhook } from "@/lib/webhooks"

/**
 * POST /api/v1/transfers — scope: transfers.write
 * { fromAccountId, toAccountNumber, amount, dedupeKey? }
 * Atomic debit/credit with idempotency; fires transaction.completed webhook.
 */
export async function POST(request: Request) {
  const auth = await authenticateApiKey(request, "transfers.write")
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status! })
  const ctx = auth.ctx!

  try {
    const body = await request.json()
    const amount = Math.round(Number(body.amount) * 100) / 100
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }
    const dedupeKey = typeof body.dedupeKey === "string" && body.dedupeKey ? body.dedupeKey : null

    if (dedupeKey) {
      const existing = await prisma.transaction.findUnique({ where: { dedupeKey } })
      if (existing) {
        return NextResponse.json({ duplicate: true, reference: existing.reference, amount: existing.amount })
      }
    }

    const reference = `API${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    const transfer = await prisma.$transaction(async (tx) => {
      const src = await tx.account.findFirst({
        where: { id: String(body.fromAccountId), userId: ctx.userId, isActive: true },
      })
      if (!src) throw new Error("SOURCE_NOT_FOUND")
      if (src.balance < amount) throw new Error("INSUFFICIENT")

      await tx.account.update({ where: { id: src.id }, data: { balance: { decrement: amount } } })

      const dest = body.toAccountNumber
        ? await tx.account.findUnique({ where: { accountNumber: String(body.toAccountNumber) } })
        : null
      if (dest && dest.id !== src.id) {
        await tx.account.update({ where: { id: dest.id }, data: { balance: { increment: amount } } })
        await tx.transaction.create({
          data: { accountId: dest.id, type: "CREDIT", amount, currency: dest.currency, status: "COMPLETED", category: "Transfer", description: "API transfer (credit leg)", reference: `${reference}C`, counterparty: `****${src.accountNumber.slice(-4)}` },
        })
      }

      return tx.transaction.create({
        data: {
          accountId: src.id,
          type: "DEBIT",
          amount: -amount,
          currency: src.currency,
          status: "COMPLETED",
          category: "Transfer",
          description: body.note ? String(body.note).slice(0, 80) : "v1 API transfer",
          reference,
          counterparty: String(body.toAccountNumber || "External"),
          ...(dedupeKey ? { dedupeKey } : {}),
        },
      })
    })

    // Fire-and-forget webhook (signed)
    deliverWebhook("transaction.completed", {
      reference,
      amount,
      type: "DEBIT",
      userId: ctx.userId,
    }).catch(() => {})

    return NextResponse.json({
      reference: transfer.reference,
      amount: -transfer.amount,
      status: transfer.status,
      createdAt: transfer.timestamp,
    }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : ""
    if (msg === "SOURCE_NOT_FOUND") return NextResponse.json({ error: "Source account not found" }, { status: 404 })
    if (msg === "INSUFFICIENT") return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    return NextResponse.json({ error: "Transfer failed" }, { status: 500 })
  }
}