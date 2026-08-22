import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { buildSchedule } from "@/lib/lending"
import { notify, audit } from "@/lib/banking"

async function requireAdmin(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return { error: "Unauthorized", status: 401 as const }
  const payload = verifyToken(token)
  if (!payload || payload.role !== "ADMIN") return { error: "Forbidden", status: 403 as const }
  return { payload }
}

export async function GET(request: Request) {
  const guard = await requireAdmin(request)
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const apps = await prisma.loanApplication.findMany({
    where: { status: { in: ["APPLIED"] } },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, email: true, kycLevel: true } } },
  })
  return NextResponse.json(apps)
}

/**
 * POST /api/admin/loans/decide
 * { applicationId, action: "approve" | "decline", note? }
 */
export async function POST(request: Request) {
  const guard = await requireAdmin(request)
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })
  const adminName = guard.payload!.name

  try {
    const body = await request.json()
    const applicationId = String(body.applicationId || "")
    const action = body.action === "approve" ? "approve" : body.action === "decline" ? "decline" : null
    const note = typeof body.note === "string" && body.note.trim() ? body.note.trim() : ""

    if (!action) return NextResponse.json({ error: "action must be approve or decline" }, { status: 400 })
    if (action === "decline" && !note) {
      return NextResponse.json({ error: "A stated reason is required to decline" }, { status: 400 })
    }

    const app = await prisma.loanApplication.findUnique({ where: { id: applicationId } })
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 })
    if (app.status !== "APPLIED") {
      return NextResponse.json({ error: `Already ${app.status}` }, { status: 409 })
    }

    if (action === "decline") {
      const updated = await prisma.loanApplication.update({
        where: { id: app.id },
        data: { status: "DECLINED", decisionReason: note, decidedBy: adminName, decidedAt: new Date() },
      })
      await notify(app.userId, "Loan Application Declined", `Reason: ${note}`)
      return NextResponse.json(updated)
    }

    // ── Approve → sanction + disbursal + stored amortization schedule ──
    const approvedAmount = app.approvedAmount ?? app.amount
    const account = await prisma.account.findFirst({
      where: { userId: app.userId, isActive: true },
      orderBy: { createdAt: "asc" },
    })
    if (!account) return NextResponse.json({ error: "User has no active account for disbursal" }, { status: 400 })

    const rate = (() => {
      try {
        const snap = JSON.parse(app.eligibilityJson || "{}")
        return Number(snap.rate) || LENDING_RATE_FALLBACK
      } catch {
        return LENDING_RATE_FALLBACK
      }
    })()

    const schedule = buildSchedule(approvedAmount, rate, app.tenureMonths, new Date())

    const loan = await prisma.$transaction(async (tx) => {
      const created = await tx.loan.create({
        data: {
          userId: app.userId,
          accountId: account.id,
          type: "PERSONAL",
          principal: approvedAmount,
          interestRate: rate,
          tenureMonths: app.tenureMonths,
          emiAmount: schedule.emi,
          outstanding: Math.round((approvedAmount + schedule.totalInterest * 0.0) * 100) / 100,
          totalPaid: 0,
          status: "ACTIVE",
          dueDate: schedule.installments[0]?.dueDate ?? new Date(Date.now() + 30 * 86400000),
          disbursedAt: new Date(),
        },
      })
      // Stored amortization — the source of truth for every EMI's split.
      for (const inst of schedule.installments) {
        await tx.amortizationInstallment.create({
          data: {
            loanId: created.id,
            no: inst.no,
            dueDate: inst.dueDate,
            openingBalance: inst.openingBalance,
            principal: inst.principal,
            interest: inst.interest,
            total: inst.total,
          },
        })
      }
      await tx.account.update({
        where: { id: account.id },
        data: { balance: { increment: approvedAmount } },
      })
      await tx.transaction.create({
        data: {
          accountId: account.id,
          type: "CREDIT",
          amount: approvedAmount,
          currency: "INR",
          status: "COMPLETED",
          category: "Loan",
          description: `Personal loan disbursed · ${rate}% · ${app.tenureMonths}m · EMI ₹${schedule.emi.toLocaleString("en-IN")}`,
          reference: `DISB${created.id.slice(-8).toUpperCase()}`,
          counterparty: "NovaPay Loans",
        },
      })
      await tx.loanApplication.update({
        where: { id: app.id },
        data: { status: "DISBURSED", loanId: created.id, decidedBy: adminName, decidedAt: new Date(), ...(note ? { decisionReason: note } : {}) },
      })
      return created
    })

    await notify(app.userId, "Loan Sanctioned 🎉", `₹${approvedAmount.toLocaleString("en-IN")} disbursed at ${rate}%. EMI: ₹${schedule.emi.toLocaleString("en-IN")}/month for ${app.tenureMonths} months.`)
    await audit(app.userId, "LOAN_DISBURSED", `₹${approvedAmount.toLocaleString("en-IN")} by ${adminName}`)
    void note

    return NextResponse.json({ loan, emi: schedule.emi, installments: schedule.installments.length })
  } catch (e) {
    console.error("loan decide failed:", e)
    return NextResponse.json({ error: "Decision processing failed" }, { status: 500 })
  }
}

const LENDING_RATE_FALLBACK = 11