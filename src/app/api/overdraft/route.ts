import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { gatherHealthInputs, computeHealthScore } from "@/lib/scoring"
import { notify, audit } from "@/lib/banking"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request)
  const p = t ? verifyToken(t) : null
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const facility = await prisma.overdraftFacility.findFirst({
    where: { userId: p.userId },
    include: { account: { select: { accountNumber: true } } },
  })
  if (!facility) return NextResponse.json({ facility: null })
  return NextResponse.json({
    facility,
    available: Math.round((facility.limit - facility.utilized) * 100) / 100,
    totalDue: Math.round((facility.utilized + facility.accruedInterest) * 100) / 100,
  })
}

/**
 * POST /api/overdraft
 * { action: "enable", limit }      → open a revolving credit line
 * { action: "utilize", amount }    → draw funds into the primary account
 * { action: "repay", amount }      → pay down interest first, then principal
 */
export async function POST(request: Request) {
  const t = getTokenFromCookies(request)
  const p = t ? verifyToken(t) : null
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
      const body = await request.json()
      const action = body.action
      // `enable` uses limit; utilize/repay use amount — accept either for enable
      const amountRaw = Number(body.amount ?? body.limit)

    const account = await prisma.account.findFirst({
      where: { userId: p.userId, isActive: true },
      orderBy: { createdAt: "asc" },
    })
    if (!account) return NextResponse.json({ error: "No active account" }, { status: 400 })

    let facility = await prisma.overdraftFacility.findUnique({
      where: { accountId: account.id },
    })

    // ── Enable ──
    if (action === "enable") {
      if (facility && facility.status === "ACTIVE") {
        return NextResponse.json({ error: "Overdraft already active" }, { status: 409 })
      }
      const me = await prisma.user.findUnique({ where: { id: p.userId }, select: { kycLevel: true } })
      if (me?.kycLevel !== "FULL") {
        return NextResponse.json({ error: "Full KYC required to open an overdraft line" }, { status: 403 })
      }
      const limit = Number.isFinite(amountRaw) ? amountRaw : NaN
      if (!Number.isFinite(limit) || limit < 5000 || limit > 500000) {
        return NextResponse.json({ error: "Limit must be between ₹5,000 and ₹5,00,000" }, { status: 400 })
      }
      const inputs = await gatherHealthInputs(p.userId)
      const incomeCap = inputs.monthlyIncome > 0 ? inputs.monthlyIncome * 4 : 50000
      const cappedLimit = Math.min(limit, Math.round(incomeCap))
      const healthScore = computeHealthScore(inputs).total
      if (healthScore < 35) {
        return NextResponse.json(
          { error: `Financial Health Score ${healthScore}/100 is too low for a credit line (min 35)` },
          { status: 403 }
        )
      }

      if (facility) {
        facility = await prisma.overdraftFacility.update({
          where: { id: facility.id },
          data: { limit: cappedLimit, status: "ACTIVE" },
        })
      } else {
        facility = await prisma.overdraftFacility.create({
          data: { accountId: account.id, userId: p.userId, limit: cappedLimit },
        })
      }
      await notify(p.userId, "Overdraft Activated", `Revolving limit of ₹${cappedLimit.toLocaleString("en-IN")} is live on your account. Interest applies only to what you use.`)
      await audit(p.userId, "OD_ENABLED", `Limit ₹${cappedLimit.toLocaleString("en-IN")} (score ${healthScore})`)
      return NextResponse.json({ facility, available: cappedLimit, cappedByIncome: cappedLimit < limit, healthScore })
    }

    if (!action || !["utilize", "repay"].includes(action)) {
      return NextResponse.json({ error: "action must be enable, utilize or repay" }, { status: 400 })
    }
    const amount = Math.round(amountRaw * 100) / 100
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }
    if (!facility || facility.status !== "ACTIVE") {
      return NextResponse.json({ error: "No active overdraft facility" }, { status: 400 })
    }

    // ── Utilize (draw money in; liability grows) ──
    if (action === "utilize") {
      const available = Math.round((facility.limit - facility.utilized) * 100) / 100
      if (amount > available) {
        return NextResponse.json({ error: `Only ₹${available.toLocaleString("en-IN")} of your overdraft is available` }, { status: 400 })
      }
      const reference = `ODU${Date.now()}`
      const result = await prisma.$transaction(async (tx) => {
        await tx.account.update({ where: { id: account.id }, data: { balance: { increment: amount } } })
        const updated = await tx.overdraftFacility.update({
          where: { id: facility!.id },
          data: { utilized: { increment: amount } },
        })
        await tx.transaction.create({
          data: {
            accountId: account.id,
            type: "CREDIT",
            amount,
            currency: "INR",
            status: "COMPLETED",
            category: "Transfer",
            description: `Overdraft drawn · ${facility.interestRate}% p.a. on utilized`,
            reference,
            counterparty: "NovaPay Credit Line",
          },
        })
        return updated
      })
      await notify(p.userId, "Overdraft Drawn", `₹${amount.toLocaleString("en-IN")} credited. Outstanding: ₹${result.utilized.toLocaleString("en-IN")}.`)
      return NextResponse.json({ facility: result, drawn: amount })
    }

    // ── Repay (interest first, then utilized principal) ──
    const totalDue = Math.round((facility.utilized + facility.accruedInterest) * 100) / 100
    const pay = Math.min(amount, totalDue)
    if (pay <= 0) return NextResponse.json({ error: "Nothing outstanding" }, { status: 400 })
    if (account.balance < pay) {
      return NextResponse.json({ error: "Insufficient balance to repay" }, { status: 400 })
    }

    const interestPortion = Math.min(pay, facility.accruedInterest)
    const principalPortion = Math.round((pay - interestPortion) * 100) / 100
    const reference = `ODR${Date.now()}`

    const result = await prisma.$transaction(async (tx) => {
      await tx.account.update({ where: { id: account.id }, data: { balance: { decrement: pay } } })
      const updated = await tx.overdraftFacility.update({
        where: { id: facility!.id },
        data: {
          accruedInterest: { decrement: interestPortion },
          utilized: { decrement: principalPortion },
        },
      })
      await tx.transaction.create({
        data: {
          accountId: account.id,
          type: "DEBIT",
          amount: -pay,
          currency: "INR",
          status: "COMPLETED",
          category: "Loan",
          description: `Overdraft repayment · interest ₹${interestPortion.toFixed(2)} + utilised ₹${principalPortion.toFixed(2)}`,
          reference,
          counterparty: "NovaPay Credit Line",
        },
      })
      return updated
    })
    await notify(p.userId, "Overdraft Repaid", `₹${pay.toLocaleString("en-IN")} paid. Remaining due: ₹${(result.utilized + result.accruedInterest).toLocaleString("en-IN")}.`)
    return NextResponse.json({ facility: result, repaid: pay, interestPortion, principalPortion })
  } catch (e) {
    console.error("overdraft failed:", e)
    return NextResponse.json({ error: "Overdraft operation failed" }, { status: 500 })
  }
}
