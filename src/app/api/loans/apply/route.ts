import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { evaluateEligibilityWithModel } from "@/lib/lending"
import { notify, audit } from "@/lib/banking"

/** POST /api/loans/apply {amount, tenureMonths, purpose} */
export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const amount = Number(body.amount)
    const tenureMonths = parseInt(body.tenureMonths, 10)
    const purpose = typeof body.purpose === "string" ? body.purpose.trim().slice(0, 120) : null

    if (!Number.isFinite(amount) || amount < 10000 || amount > 5_000_000) {
      return NextResponse.json({ error: "Loan amount must be between ₹10,000 and ₹50,00,000" }, { status: 400 })
    }
    if (!Number.isInteger(tenureMonths) || tenureMonths < 6 || tenureMonths > 84) {
      return NextResponse.json({ error: "Tenure must be between 6 and 84 months" }, { status: 400 })
    }

    // Pending application guard
    const pending = await prisma.loanApplication.findFirst({
      where: { userId: p.userId, status: "APPLIED" },
    })
    if (pending) {
      return NextResponse.json({ error: "You already have an application under review" }, { status: 409 })
    }

    const eligibility = await evaluateEligibilityWithModel(p.userId, amount, tenureMonths)

    const app = await prisma.loanApplication.create({
      data: {
        userId: p.userId,
        amount,
        tenureMonths,
        purpose,
        status: eligibility.decision === "DECLINE" ? "DECLINED" : "APPLIED",
        eligibilityJson: JSON.stringify(eligibility),
        approvedAmount: eligibility.decision === "DECLINE" ? 0 : eligibility.approvedAmount,
        decisionReason: eligibility.reasons.join(" "),
        decidedAt: eligibility.decision === "DECLINE" ? new Date() : null,
      },
    })

    await audit(p.userId, "LOAN_APPLICATION", `Applied for ₹${amount.toLocaleString("en-IN")} over ${tenureMonths}m — ${eligibility.decision}`)

    if (eligibility.decision === "DECLINE") {
      return NextResponse.json({
        application: app,
        decision: eligibility.decision,
        reasons: eligibility.reasons,
        declined: true,
      })
    }

    return NextResponse.json({
      application: app,
      decision: eligibility.decision,
      approvedAmount: eligibility.approvedAmount,
      rate: eligibility.rate,
      reasons: eligibility.reasons,
    })
  } catch {
    return NextResponse.json({ error: "Could not submit application" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const apps = await prisma.loanApplication.findMany({
    where: { userId: p.userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  })
  return NextResponse.json(apps)
}

// PATCH: withdraw an APPLIED application before admin decision
export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await request.json()
  const result = await prisma.loanApplication.updateMany({
    where: { id, userId: p.userId, status: "APPLIED" },
    data: { status: "WITHDRAWN", decidedAt: new Date() },
  })
  if (result.count === 0) return NextResponse.json({ error: "Not found or not withdrawable" }, { status: 404 })
  void notify
  return NextResponse.json({ ok: true })
}