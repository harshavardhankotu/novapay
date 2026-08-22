import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/** GET /api/loans/[id]/schedule — stored reducing-balance installments. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const t = getTokenFromCookies(request)
  const p = t ? verifyToken(t) : null
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const loan = await prisma.loan.findFirst({
    where: { id, userId: p.userId },
    include: {
      schedule: { orderBy: { no: "asc" } },
    },
  })
  if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 })

  const paidCount = loan.schedule.filter((i) => i.paidAt).length
  return NextResponse.json({
    loan: {
      id: loan.id,
      type: loan.type,
      principal: loan.principal,
      interestRate: loan.interestRate,
      tenureMonths: loan.tenureMonths,
      emiAmount: loan.emiAmount,
      outstanding: loan.outstanding,
      totalPaid: loan.totalPaid,
      status: loan.status,
      collectionsStatus: (loan as any).collectionsStatus ?? "CURRENT",
      penaltyAccrued: (loan as any).penaltyAccrued ?? 0,
    },
    installments: loan.schedule,
    paidCount,
  })
}