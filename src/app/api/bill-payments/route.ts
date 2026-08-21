import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { billerId, amount: rawAmount } = await request.json()
    if (typeof rawAmount !== "number" || !Number.isFinite(rawAmount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }
    const amount = Math.round(rawAmount * 100) / 100
    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 })
    }

    const biller = await prisma.biller.findFirst({ where: { id: billerId, userId: p.userId } })
    if (!biller) return NextResponse.json({ error: "Biller not found" }, { status: 404 })

    const reference = `BILL${Date.now()}`
    const payment = await prisma.$transaction(async (tx) => {
      // Re-read balance inside the transaction to prevent concurrent overdraw
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
          amount,
          currency: account.currency,
          status: "COMPLETED",
          category: "Bills",
          description: `Payment to ${biller.nickname || biller.name}`,
          reference,
          counterparty: biller.name,
        },
      })
      return tx.billPayment.create({ data: { userId: p.userId, billerId, amount, reference } })
    })

    return NextResponse.json(payment)
  } catch (error) {
    if (error instanceof Error && error.message === "NO_ACCOUNT") {
      return NextResponse.json({ error: "No active account found" }, { status: 400 })
    }
    if (error instanceof Error && error.message === "INSUFFICIENT") {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }
    return NextResponse.json({ error: "Payment failed" }, { status: 500 })
  }
}