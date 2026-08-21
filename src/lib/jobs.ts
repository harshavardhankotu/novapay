import { prisma } from "@/lib/prisma"
import { notify, audit, LimitError, assertDebitAllowed } from "@/lib/banking"

export interface JobSummary {
  fdMatured: number
  emisProcessed: number
  emisSkipped: number
  mandatesProcessed: number
  mandatesSkipped: number
}

export function advanceDate(d: Date, frequency: string): Date {
  const next = new Date(d)
  switch (frequency) {
    case "DAILY": next.setDate(next.getDate() + 1); break
    case "WEEKLY": next.setDate(next.getDate() + 7); break
    case "YEARLY": next.setFullYear(next.getFullYear() + 1); break
    case "MONTHLY":
    default: next.setMonth(next.getMonth() + 1)
  }
  return next
}

/**
 * Runs all time-driven banking jobs for one user:
 *  - FD maturity: credits principal + interest back to the source account
 *  - Loan EMI auto-debit: advances due date, tracks outstanding, closes loan
 *  - Mandate (NACH) scheduled debits: Netflix-style recurring pulls
 * Everything is idempotent — safe to run repeatedly.
 */
export async function processUserJobs(userId: string): Promise<JobSummary> {
  const now = new Date()
  const summary: JobSummary = { fdMatured: 0, emisProcessed: 0, emisSkipped: 0, mandatesProcessed: 0, mandatesSkipped: 0 }

  // ── 1. Fixed Deposit maturities ──────────────────────────────────────────
  const maturedFds = await prisma.fixedDeposit.findMany({
    where: { userId, status: "ACTIVE", maturityDate: { lte: now } },
    include: { account: true },
  })
  for (const fd of maturedFds) {
    const payout = fd.maturityAmount ?? fd.amount
    await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: fd.accountId },
        data: { balance: { increment: payout } },
      })
      await tx.transaction.create({
        data: {
          accountId: fd.accountId,
          type: "CREDIT",
          amount: payout,
          currency: "INR",
          status: "COMPLETED",
          category: "Investment",
          description: `FD matured · ₹${fd.amount.toLocaleString("en-IN")} @ ${fd.interestRate}% for ${fd.tenureMonths}m`,
          reference: `FDM${fd.id.slice(-8).toUpperCase()}${Date.now().toString().slice(-5)}`,
          counterparty: "NovaPay Deposits",
        },
      })
      await tx.fixedDeposit.update({ where: { id: fd.id }, data: { status: "MATURED" } })
    })
    await notify(userId, "FD Matured 🎉", `Your fixed deposit of ₹${fd.amount.toLocaleString("en-IN")} matured. ₹${payout.toLocaleString("en-IN")} credited to your account.`)
    await audit(userId, "FD_MATURED", `FD ${fd.id} paid out ₹${payout}`)
    summary.fdMatured++
  }

  // ── 2. Loan EMI auto-debit ────────────────────────────────────────────────
  const dueLoans = await prisma.loan.findMany({
    where: { userId, status: "ACTIVE", dueDate: { lte: now }, outstanding: { gt: 0 } },
    include: { account: true },
  })
  for (const loan of dueLoans) {
    const emi = Math.min(loan.emiAmount, loan.outstanding)
    const dueDate = loan.dueDate ?? now
    try {
      // EMI debits respect KYC limits too — banks do the same for high-value EMIs
      await assertDebitAllowed(userId, loan.accountId, emi)
      if (loan.account.balance < emi) throw new Error("INSUFFICIENT")

      const newOutstanding = Math.max(0, Math.round((loan.outstanding - emi) * 100) / 100)
      const closed = newOutstanding === 0
      await prisma.$transaction(async (tx) => {
        await tx.account.update({
          where: { id: loan.accountId },
          data: { balance: { decrement: emi } },
        })
        await tx.transaction.create({
          data: {
            accountId: loan.accountId,
            type: "DEBIT",
            amount: -emi,
            currency: "INR",
            status: "COMPLETED",
            category: "Loan",
            description: `${loan.type.charAt(0)}${loan.type.slice(1).toLowerCase()} EMI · ${closed ? "final" : "auto"}-debit`,
            reference: `EMI${loan.id.slice(-8).toUpperCase()}${Date.now().toString().slice(-5)}`,
            counterparty: "NovaPay Loans",
          },
        })
        await tx.loan.update({
          where: { id: loan.id },
          data: {
            outstanding: newOutstanding,
            totalPaid: { increment: emi },
            status: closed ? "CLOSED" : "ACTIVE",
            ...(closed ? {} : { dueDate: advanceDate(dueDate, "MONTHLY") }),
          },
        })
      })
      await notify(userId, closed ? "Loan Closed 🎉" : "EMI Debited", closed ? `Congratulations! Your ${loan.type.toLowerCase()} loan is fully repaid.` : `EMI of ₹${emi.toLocaleString("en-IN")} deducted. Remaining: ₹${newOutstanding.toLocaleString("en-IN")}.`)
      summary.emisProcessed++
    } catch {
      // Insufficient balance / limit hit → mark overdue by pushing due date a day,
      // notify, and retry tomorrow (banks charge penalties; we keep it gentle).
      await prisma.loan.update({
        where: { id: loan.id },
        data: { dueDate: new Date(now.getTime() + 86400000) },
      })
      await notify(userId, "EMI Payment Failed", `₹${emi.toLocaleString("en-IN")} EMI could not be processed (insufficient balance). We'll retry tomorrow.`)
      summary.emisSkipped++
    }
  }

  // ── 3. Mandate / NACH scheduled debits ────────────────────────────────────
  const dueMandates = await prisma.paymentMandate.findMany({
    where: { userId, status: "ACTIVE", nextRun: { lte: now } },
    include: { account: true },
  })
  for (const mandate of dueMandates) {
    try {
      await assertDebitAllowed(userId, mandate.accountId, mandate.amount)
      if (mandate.account.balance < mandate.amount) throw new Error("INSUFFICIENT")

      const nextRun = advanceDate(mandate.nextRun, mandate.frequency)
      await prisma.$transaction(async (tx) => {
        await tx.account.update({
          where: { id: mandate.accountId },
          data: { balance: { decrement: mandate.amount } },
        })
        await tx.transaction.create({
          data: {
            accountId: mandate.accountId,
            type: "DEBIT",
            amount: -mandate.amount,
            currency: "INR",
            status: "COMPLETED",
            category: "Bills",
            description: `Mandate debit · ${mandate.name} (${mandate.frequency.toLowerCase()})`,
            reference: `MAND${mandate.umrn?.slice(-6) || mandate.id.slice(-6)}${Date.now().toString().slice(-6)}`,
            counterparty: mandate.name,
          },
        })
        await tx.paymentMandate.update({
          where: { id: mandate.id },
          data: { nextRun, debitCount: { increment: 1 } },
        })
      })
      await notify(userId, "Mandate Executed", `₹${mandate.amount.toLocaleString("en-IN")} debited for ${mandate.name}. Next: ${nextRun.toLocaleDateString()}.`)
      summary.mandatesProcessed++
    } catch {
      await prisma.paymentMandate.update({
        where: { id: mandate.id },
        data: { nextRun: new Date(now.getTime() + 86400000), status: "PAUSED" },
      })
      await notify(userId, "Mandate Paused", `${mandate.name} was paused — insufficient balance for ₹${mandate.amount.toLocaleString("en-IN")}. Resume it from Mandates.`)
      summary.mandatesSkipped++
    }
  }

  return summary
}

/** Admin variant: run jobs for every active user. */
export async function processAllUsersJobs(): Promise<JobSummary & { users: number }> {
  const users = await prisma.user.findMany({ where: { status: "ACTIVE" }, select: { id: true } })
  const total: JobSummary & { users: number } = { fdMatured: 0, emisProcessed: 0, emisSkipped: 0, mandatesProcessed: 0, mandatesSkipped: 0, users: users.length }
  for (const u of users) {
    const s = await processUserJobs(u.id)
    total.fdMatured += s.fdMatured
    total.emisProcessed += s.emisProcessed
    total.emisSkipped += s.emisSkipped
    total.mandatesProcessed += s.mandatesProcessed
    total.mandatesSkipped += s.mandatesSkipped
  }
  return total
}