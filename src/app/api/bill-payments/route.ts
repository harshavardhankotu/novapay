import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { assertDebitAllowed, awardSpendPoints, notify, audit, LimitError, updateBudgetSpent } from "@/lib/banking"

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { billerId } = body
    if (typeof billerId !== "string" || !billerId) {
      return NextResponse.json({ error: "Invalid payment details" }, { status: 400 })
    }
    if (typeof body.amount !== "number" || !Number.isFinite(body.amount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }
    const amount = Math.round(body.amount * 100) / 100
    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 })
    }

    // Idempotency
    const dedupeKey = typeof body.dedupeKey === "string" && body.dedupeKey ? body.dedupeKey : null
    if (dedupeKey) {
      const existing = await prisma.transaction.findUnique({ where: { dedupeKey } })
      if (existing) {
        return NextResponse.json({ duplicate: true, reference: existing.reference })
      }
    }

    await assertDebitAllowed(p.userId, "*", amount)

    const biller = await prisma.biller.findFirst({ where: { id: billerId, userId: p.userId } })
    if (!biller) return NextResponse.json({ error: "Biller not found" }, { status: 404 })

    const reference = `BILL${Date.now()}`

    const payment = await prisma.$transaction(async (tx) => {
      const account = await tx.account.findFirst({
        where: { userId: p.userId, isActive: true },
        orderBy: { createdAt: "asc" },
      })
      if (!account) throw new Error("NO_ACCOUNT")
      if (account.balance < amount) throw new Error("INSUFFICIENT")

      await tx.account.update({ where: { id: account.id }, data: { balance: { decrement: amount } } })
      await tx.transaction.create({
        data: {
          accountId: account.id,
          type: "DEBIT",
          amount: -amount, // signed ledger convention
          currency: account.currency,
          status: "COMPLETED",
          category: "Bills",
          description: `Payment to ${biller.nickname || biller.name}`,
          reference,
          counterparty: biller.name,
          ...(dedupeKey ? { dedupeKey } : {}),
        },
      })
      return tx.billPayment.create({ data: { userId: p.userId, billerId, amount, reference } })
    })

    const points = await awardSpendPoints(p.userId, amount)
    await updateBudgetSpent(p.userId, "Bills", amount)
    await notify(p.userId, "Bill Payment Successful", `₹${amount.toLocaleString("en-IN")} paid to ${biller.nickname || biller.name}${points ? ` · +${points} NovaPoints` : ""}`)
    await audit(p.userId, "BILL_PAYMENT", `₹${amount} paid to ${biller.name} (${reference})`)

    return NextResponse.json(payment)
  } catch (error) {
    if (error instanceof LimitError) {
      const status = error.code === "KYC_REQUIRED" ? 403 : 400
      return NextResponse.json({ error: error.message, code: error.code }, { status })
    }
    if (error instanceof Error && error.message === "NO_ACCOUNT") {
      return NextResponse.json({ error: "No active account found" }, { status: 400 })
    }
    if (error instanceof Error && error.message === "INSUFFICIENT") {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }
    return NextResponse.json({ error: "Payment failed" }, { status: 500 })
  }
}