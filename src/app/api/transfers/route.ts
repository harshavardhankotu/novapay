import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const { fromAccountId, toAccountNumber, ifsc, amount, note, type } = await request.json()

  if (!fromAccountId || !amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid transfer details" }, { status: 400 })
  }

  const fromAccount = await prisma.account.findFirst({
    where: { id: fromAccountId, userId: payload.userId },
  })
  if (!fromAccount) return NextResponse.json({ error: "Account not found" }, { status: 404 })
  if (fromAccount.balance < amount) return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })

  const reference = `TXN${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`

  const transfer = await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: fromAccountId },
      data: { balance: { decrement: amount } },
    })

    if (toAccountNumber) {
      const toAccount = await tx.account.findUnique({ where: { accountNumber: toAccountNumber } })
      if (toAccount) {
        await tx.account.update({
          where: { id: toAccount.id },
          data: { balance: { increment: amount } },
        })
      }
    }

    const txRecord = await tx.transaction.create({
      data: {
        accountId: fromAccountId,
        type: "DEBIT",
        amount,
        currency: fromAccount.currency,
        status: "COMPLETED",
        category: "Transfer",
        description: note || `Transfer to ${toAccountNumber || "external"}`,
        reference,
        counterparty: toAccountNumber || "External Account",
      },
    })

    return txRecord
  })

  return NextResponse.json({ transfer, reference })
}
