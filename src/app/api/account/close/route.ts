import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notify } from "@/lib/banking"

/**
 * POST /api/account/close — final settlement workflow.
 *  1. Compute dues: active loans outstanding+penalty, OD utilized+accrued.
 *  2. If balance covers dues → debit them, mark account inactive, log closure.
 *  3. Nominee notification is simulated (recorded on the closure row).
 */
export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const accountId = String(body.accountId || "")
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: p.userId },
    })
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 })

    const otherAccounts = await prisma.account.count({
      where: { userId: p.userId, isActive: true, NOT: { id: accountId } },
    })

    // Dues
    const loans = await prisma.loan.findMany({
      where: { userId: p.userId, status: "ACTIVE", accountId },
      select: { outstanding: true, penaltyAccrued: true, emiAmount: true },
    })
    const odFacilities = await prisma.overdraftFacility.findMany({
      where: { accountId, status: "ACTIVE" },
      select: { utilized: true, accruedInterest: true },
    })
    const loanDues = loans.reduce((s, l) => s + l.outstanding + l.penaltyAccrued + l.emiAmount, 0)
    const odDues = odFacilities.reduce((s, o) => s + o.utilized + o.accruedInterest, 0)
    const totalDues = Math.round((loanDues + odDues) * 100) / 100

    if (totalDues > 0 && account.balance < totalDues) {
      return NextResponse.json({
        error: `Settlement requires ₹${totalDues.toLocaleString("en-IN")} in dues but your balance is only ₹${account.balance.toLocaleString("en-IN")}. Clear pending credit-line dues first.`,
        dues: totalDues,
      }, { status: 400 })
    }

    const closure = await prisma.$transaction(async (tx) => {
      let duesDeducted = 0
      if (totalDues > 0) {
        await tx.account.update({
          where: { id: account.id },
          data: { balance: { decrement: totalDues } },
        })
        await tx.transaction.create({
          data: {
            accountId: account.id,
            type: "DEBIT",
            amount: -totalDues,
            currency: "INR",
            status: "COMPLETED",
            category: "Other",
            description: "Final settlement — loan/OD dues recovered",
            reference: `CLS${Date.now()}`,
            counterparty: "NovaPay Settlements",
          },
        })
        // Close the credit facilities and active loans tied to this account
        await tx.overdraftFacility.updateMany({
          where: { accountId: account.id },
          data: { status: "CLOSED" },
        })
        await tx.loan.updateMany({
          where: { userId: p.userId, accountId: account.id, status: "ACTIVE" },
          data: { status: "CLOSED" },
        })
        duesDeducted = totalDues
      }
      await tx.account.update({ where: { id: account.id }, data: { isActive: false } })
      return tx.accountClosure.create({
        data: {
          userId: p.userId,
          accountId: account.id,
          finalBalance: Math.round((account.balance - duesDeducted) * 100) / 100,
          duesDeducted,
          status: "SETTLED",
          nomineeNotified: account.nomineeName ? `simulated-notice-to:${account.nomineeName}` : "no-nominee",
        },
      })
    })

    if (otherAccounts === 0) {
      // Last account closed → end the session; user must re-register to bank again
      await prisma.user.update({ where: { id: p.userId }, data: { status: "CLOSED" } }).catch(() => {})
    }

    await notify(p.userId, "Account Closed", `${account.type} ····${account.accountNumber.slice(-4)} settled and closed.${closure.duesDeducted > 0 ? ` Dues recovered: ₹${closure.duesDeducted.toLocaleString("en-IN")}.` : ""}${account.nomineeName ? ` Nominee (${account.nomineeName}) has been notified.` : ""}`)
    void otherAccounts

    return NextResponse.json(closure)
  } catch (e) {
    console.error("closure failed:", e)
    return NextResponse.json({ error: "Closure failed" }, { status: 500 })
  }
}