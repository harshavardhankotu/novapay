import { prisma } from "@/lib/prisma"
import { notify, audit, assertDebitAllowed } from "@/lib/banking"
import { getSlabRate, fdMaturity, rdMaturity, computeTds, savingsMonthlyInterest } from "@/lib/deposits"
import { upsertWeeklySnapshot } from "@/lib/scoring"

export interface JobSummary {
  fdMatured: number
  fdRenewed: number
  rdMatured: number
  emisProcessed: number
  emisSkipped: number
  mandatesProcessed: number
  mandatesSkipped: number
  savingsAccountsCredited: number
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
  const summary: JobSummary = { fdMatured: 0, fdRenewed: 0, rdMatured: 0, emisProcessed: 0, emisSkipped: 0, mandatesProcessed: 0, mandatesSkipped: 0, savingsAccountsCredited: 0 }

  // ── 0. Savings interest (monthly credit, once per account per month) ────
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = new Date(monthStart.getTime() - 1)

  const activeAccounts = await prisma.account.findMany({ where: { userId, isActive: true } })
  for (const account of activeAccounts) {
    const alreadyCredited = await prisma.interestEntry.findFirst({
      where: {
        accountId: account.id,
        product: "SAVINGS",
        periodEnd: { gte: prevMonthStart, lte: now },
      },
    })
    if (alreadyCredited) continue
    const rate = await getSlabRate("SAVINGS", account.balance)
    const interest = savingsMonthlyInterest(account.balance, rate)
    if (interest <= 0) continue
    const reference = `SINT${account.id.slice(-6).toUpperCase()}${now.getTime().toString().slice(-7)}`
    await prisma.$transaction(async (tx) => {
      await tx.account.update({ where: { id: account.id }, data: { balance: { increment: interest } } })
      await tx.transaction.create({
        data: {
          accountId: account.id,
          type: "CREDIT",
          amount: interest,
          currency: "INR",
          status: "COMPLETED",
          category: "Interest",
          description: `Savings interest · ${rate}% p.a. for ${prevMonthStart.toLocaleString("en-IN", { month: "long" })}`,
          reference,
          counterparty: "NovaPay Deposits",
        },
      })
      await tx.interestEntry.create({
        data: {
          userId, accountId: account.id, product: "SAVINGS",
          grossInterest: interest, tds: 0, netCredit: interest,
          periodStart: prevMonthStart, periodEnd: prevMonthEnd,
        },
      })
    })
    summary.savingsAccountsCredited++
  }

  // ── 1. Fixed Deposit maturities (slab rate · TDS · auto-renew) ───────────
  const maturedFds = await prisma.fixedDeposit.findMany({
    where: { userId, status: "ACTIVE", maturityDate: { lte: now } },
    include: { account: true },
  })
  for (const fd of maturedFds) {
    const slabRate = await getSlabRate("FD", fd.amount, fd.tenureMonths)
    const grossInterest =
      fd.maturityAmount > fd.amount
        ? Math.round((fd.maturityAmount - fd.amount) * 100) / 100
        : Math.round((fdMaturity(fd.amount, fd.interestRate || slabRate, fd.tenureMonths) - fd.amount) * 100) / 100

    // Auto-renew: capitalise interest into principal, roll the tenure forward
    if (fd.autoRenew) {
      const newPrincipal = Math.round((fd.amount + grossInterest) * 100) / 100
      const newMaturity = advanceDate(fd.maturityDate, "YEARLY") // tenure-preserving roll for common cases
      const newMaturityAmount = fdMaturity(newPrincipal, fd.interestRate || slabRate, fd.tenureMonths)
      await prisma.$transaction(async (tx) => {
        await tx.fixedDeposit.update({
          where: { id: fd.id },
          data: {
            amount: newPrincipal,
            interestRate: fd.interestRate || slabRate,
            maturityDate: new Date(fd.maturityDate.getTime() + fd.tenureMonths * 30 * 86400000),
            maturityAmount: newMaturityAmount,
          },
        })
        await tx.interestEntry.create({
          data: {
            userId, accountId: fd.accountId, product: "FD",
            grossInterest, tds: 0, netCredit: 0, // capitalised, not paid out
            periodStart: fd.createdAt, periodEnd: fd.maturityDate,
          },
        })
      })
      await notify(userId, "FD Auto-Renewed", `₹${newPrincipal.toLocaleString("en-IN")} reinvested at ${fd.interestRate || slabRate}% — interest of ₹${grossInterest.toLocaleString("en-IN")} capitalised.`)
      summary.fdRenewed++
      continue
    }

    // Normal maturity: TRUE double-entry — credit gross, then debit TDS so
    // the ledger sum always reconciles with the balance delta.
    const tdsResult = await computeTds(userId, grossInterest)
    const grossPayout = Math.round((fd.amount + grossInterest) * 100) / 100

    await prisma.$transaction(async (tx) => {
      // 1. Credit the full gross maturity proceeds
      await tx.account.update({
        where: { id: fd.accountId },
        data: { balance: { increment: grossPayout } },
      })
      await tx.transaction.create({
        data: {
          accountId: fd.accountId,
          type: "CREDIT",
          amount: grossPayout,
          currency: "INR",
          status: "COMPLETED",
          category: "Investment",
          description: `FD matured · ₹${fd.amount.toLocaleString("en-IN")} @ ${fd.interestRate}% for ${fd.tenureMonths}m`,
          reference: `FDM${fd.id.slice(-8).toUpperCase()}${Date.now().toString().slice(-5)}`,
          counterparty: "NovaPay Deposits",
        },
      })
      // 2. Debit TDS as its own ledger movement (balance-affecting)
      if (tdsResult.tds > 0) {
        await tx.account.update({
          where: { id: fd.accountId },
          data: { balance: { decrement: tdsResult.tds } },
        })
        await tx.transaction.create({
          data: {
            accountId: fd.accountId,
            type: "DEBIT",
            amount: -tdsResult.tds,
            currency: "INR",
            status: "COMPLETED",
            category: "TDS",
            description: `TDS on FD interest (${fyShort()})`,
            reference: `TDS${fd.id.slice(-8).toUpperCase()}${Date.now().toString().slice(-5)}`,
            counterparty: "Income Tax Department",
          },
        })
      }
      await tx.interestEntry.create({
        data: {
          userId, accountId: fd.accountId, product: "FD",
          grossInterest, tds: tdsResult.tds, netCredit: tdsResult.netInterest,
          periodStart: fd.createdAt, periodEnd: fd.maturityDate,
        },
      })
      await tx.fixedDeposit.update({ where: { id: fd.id }, data: { status: "MATURED" } })
    })
    await notify(userId, "FD Matured 🎉", `Your fixed deposit of ₹${fd.amount.toLocaleString("en-IN")} matured. ₹${grossPayout.toLocaleString("en-IN")} credited to your account.${tdsResult.tds > 0 ? ` TDS deducted: ₹${tdsResult.tds}.` : ""}`)
    await audit(userId, "FD_MATURED", `FD ${fd.id} paid out ₹${grossPayout} (TDS ₹${tdsResult.tds})`)
    summary.fdMatured++
  }

  // ── 1b. Recurring Deposit maturities (quarterly compounding) ──────────────
  const maturedRds = await prisma.recurringDeposit.findMany({
    where: { userId, status: "ACTIVE", maturityDate: { lte: now } },
  })
  for (const rd of maturedRds) {
    const invested = rd.totalDeposited || rd.monthlyAmount * rd.tenureMonths
    const rate = rd.interestRate || (await getSlabRate("RD", rd.monthlyAmount, rd.tenureMonths))
    const maturity = rdMaturity(rd.monthlyAmount, rate, rd.tenureMonths)
    const grossInterest = Math.max(0, Math.round((maturity - invested) * 100) / 100)

    await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: rd.accountId },
        data: { balance: { increment: invested + grossInterest } },
      })
      await tx.transaction.create({
        data: {
          accountId: rd.accountId,
          type: "CREDIT",
          amount: invested + grossInterest,
          currency: "INR",
          status: "COMPLETED",
          category: "Investment",
          description: `RD matured · ₹${rd.monthlyAmount.toLocaleString("en-IN")}/mo × ${rd.tenureMonths}m @ ${rate}%`,
          reference: `RDM${rd.id.slice(-8).toUpperCase()}${Date.now().toString().slice(-5)}`,
          counterparty: "NovaPay Deposits",
        },
      })
      await tx.interestEntry.create({
        data: {
          userId, accountId: rd.accountId, product: "RD",
          grossInterest, tds: 0, netCredit: grossInterest,
          periodStart: rd.createdAt, periodEnd: rd.maturityDate,
        },
      })
      await tx.recurringDeposit.update({ where: { id: rd.id }, data: { status: "MATURED" } })
    })
    await notify(userId, "RD Matured", `Recurring deposit completed. ₹${(invested + grossInterest).toLocaleString("en-IN")} credited (interest ₹${grossInterest.toLocaleString("en-IN")}).`)
    summary.rdMatured++
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

  // ── 4. Financial Health Score weekly snapshot ─────────────────────────────
  try {
    await upsertWeeklySnapshot(userId)
  } catch {
    // scoring must never break the batch
  }

  return summary
}

/** Admin variant: run jobs for every active user. */
export async function processAllUsersJobs(): Promise<JobSummary & { users: number }> {
  const users = await prisma.user.findMany({ where: { status: "ACTIVE" }, select: { id: true } })
  const total: JobSummary & { users: number } = { fdMatured: 0, fdRenewed: 0, rdMatured: 0, emisProcessed: 0, emisSkipped: 0, mandatesProcessed: 0, mandatesSkipped: 0, savingsAccountsCredited: 0, users: users.length }
  for (const u of users) {
    const s = await processUserJobs(u.id)
    total.fdMatured += s.fdMatured
    total.fdRenewed += s.fdRenewed
    total.rdMatured += s.rdMatured
    total.emisProcessed += s.emisProcessed
    total.emisSkipped += s.emisSkipped
    total.mandatesProcessed += s.mandatesProcessed
    total.mandatesSkipped += s.mandatesSkipped
    total.savingsAccountsCredited += s.savingsAccountsCredited
  }
  return total
}

function fyShort(): string {
  const d = new Date()
  return d.getMonth() >= 3 ? `FY${d.getFullYear()}-${String(d.getFullYear() + 1).slice(2)}` : `FY${d.getFullYear() - 1}-${String(d.getFullYear()).slice(2)}`
}