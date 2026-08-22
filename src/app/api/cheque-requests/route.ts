import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json(await prisma.chequeRequest.findMany({
    where: { userId: p.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  }))
}

/**
 * POST — cheque-book / demand-draft request.
 * Simulated clearing house: cheque books issue instantly, DDs are issued on
 * debit of the amount + ₹50 DD charges (all clearly labeled as simulation).
 */
export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json()
    const type = body.type === "DD" ? "DD" : "CHEQUE_BOOK"
    const leaves = type === "CHEQUE_BOOK" ? Math.min(50, Math.max(10, parseInt(body.leaves, 10) || 25)) : null
    const payee = typeof body.payee === "string" && body.payee.trim() ? body.payee.trim().slice(0, 80) : (type === "DD" ? null : undefined)
    const ddAmount = type === "DD" ? Math.round(Number(body.amount) * 100) / 100 : null

    if (type === "DD") {
      if (!payee) return NextResponse.json({ error: "Payee name required for a demand draft" }, { status: 400 })
      if (ddAmount == null || !Number.isFinite(ddAmount) || ddAmount <= 0) return NextResponse.json({ error: "Invalid DD amount" }, { status: 400 })
      const account = await prisma.account.findFirst({ where: { userId: p.userId, isActive: true }, orderBy: { createdAt: "asc" } })
      if (!account) return NextResponse.json({ error: "No active account" }, { status: 400 })
      const totalDebit = Math.round((ddAmount! + 50) * 100) / 100
      if (account.balance < totalDebit) return NextResponse.json({ error: "Insufficient balance for DD + ₹50 charges" }, { status: 400 })

      const reference = `DD${Date.now()}`
      await prisma.$transaction(async (tx) => {
        await tx.account.update({ where: { id: account.id }, data: { balance: { decrement: totalDebit } } })
        await tx.transaction.create({
          data: { accountId: account.id, type: "DEBIT", amount: -totalDebit, currency: "INR", status: "COMPLETED", category: "Other", description: `Demand draft to ${payee} (incl ₹50 charges)`, reference, counterparty: "NovaPay Clearing (simulated)" },
        })
        void tx
      })

      const cr = await prisma.chequeRequest.create({
        data: { userId: p.userId, type, payee, amount: ddAmount, status: "ISSUED", reference, issuedAt: new Date() },
      })
      return NextResponse.json(cr)
    }

    // Cheque book — no money movement, just the request lifecycle
    const reference = `CHQ${Date.now()}`
    const cr = await prisma.chequeRequest.create({
      data: { userId: p.userId, type, leaves, status: "ISSUED", reference, issuedAt: new Date() },
    })
    return NextResponse.json(cr)
  } catch {
    return NextResponse.json({ error: "Could not create request" }, { status: 500 })
  }
}