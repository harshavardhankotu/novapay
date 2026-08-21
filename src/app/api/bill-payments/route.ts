import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { billerId, amount } = await request.json()
  if (!billerId || !amount || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Invalid payment details" }, { status: 400 })
  }

  const biller = await prisma.biller.findFirst({ where: { id: billerId, userId: p.userId } })
  if (!biller) return NextResponse.json({ error: "Biller not found" }, { status: 404 })

  const account = await prisma.account.findFirst({
    where: { userId: p.userId, isActive: true },
    orderBy: { createdAt: "asc" },
  })
  if (!account) return NextResponse.json({ error: "No active account found" }, { status: 400 })
  if (account.balance < amount) return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })

  const reference = `BILL${Date.now()}`
  const payment = await prisma.$transaction(async (tx) => {
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
}