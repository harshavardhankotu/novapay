import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EXTRACTABLE_CATEGORIES } from "@/lib/ocr"
import { assertDebitAllowed, LimitError, updateBudgetSpent, awardSpendPoints } from "@/lib/banking"

/**
 * POST /api/receipts/post — records a receipt ONLY after the user has
 * confirmed/edited the extracted fields. Server re-validates everything.
 * { accountId, merchant, amount, category }
 */
export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const account = await prisma.account.findFirst({
      where: { id: String(body.accountId), userId: p.userId, isActive: true },
    })
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 })

    const merchant = typeof body.merchant === "string" ? body.merchant.trim().slice(0, 60) : ""
    const amount = Math.round(Number(body.amount) * 100) / 100
    const category = String(body.category || "")
    if (!merchant) return NextResponse.json({ error: "Merchant required" }, { status: 400 })
    if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    if (!(EXTRACTABLE_CATEGORIES as readonly string[]).includes(category)) {
      return NextResponse.json({ error: "Category outside the allowed list" }, { status: 400 })
    }

    await assertDebitAllowed(p.userId, account.id, amount)

    const reference = `RCP${Date.now()}`
    const txn = await prisma.$transaction(async (tx) => {
      await tx.account.update({ where: { id: account.id }, data: { balance: { decrement: amount } } })
      return tx.transaction.create({
        data: {
          accountId: account.id,
          type: "DEBIT",
          amount: -amount,
          currency: "INR",
          status: "COMPLETED",
          category: category === "Groceries" ? "Food & Dining" : category,
          description: `${merchant} · receipt capture`,
          reference,
          counterparty: merchant,
        },
      })
    })

    const points = await awardSpendPoints(p.userId, amount)
    void points
    await updateBudgetSpent(p.userId, category === "Groceries" ? "Food" : category.split(" ")[0], amount)

    return NextResponse.json({ transaction: txn, pointsEarned: points })
  } catch (e) {
    if (e instanceof LimitError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: e.code === "KYC_REQUIRED" ? 403 : 400 })
    }
    return NextResponse.json({ error: "Could not record expense" }, { status: 500 })
  }
}