import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

class ApiError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

function toValidAmount(raw: unknown): number {
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    throw new ApiError(400, "Invalid amount")
  }
  const rounded = Math.round(raw * 100) / 100
  if (rounded <= 0) throw new ApiError(400, "Amount must be greater than zero")
  return rounded
}

export async function POST(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  try {
    const { fromAccountId, toAccountNumber, amount: rawAmount, note } = await request.json()
    const amount = toValidAmount(rawAmount)

    if (!fromAccountId) {
      return NextResponse.json({ error: "Invalid transfer details" }, { status: 400 })
    }

    const reference = `TXN${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    const transfer = await prisma.$transaction(async (tx) => {
      // Balance check happens INSIDE the transaction so concurrent
      // transfers cannot overdraw the account.
      const fromAccount = await tx.account.findFirst({
        where: { id: fromAccountId, userId: payload.userId },
      })
      if (!fromAccount) throw new ApiError(404, "Account not found")
      if (fromAccount.balance < amount) throw new ApiError(400, "Insufficient balance")

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

      return tx.transaction.create({
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
    })

    return NextResponse.json({ transfer, reference })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Transfer failed" }, { status: 500 })
  }
}