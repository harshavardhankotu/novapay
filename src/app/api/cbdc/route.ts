import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * ── Digital Rupee (e₹) wallet — SIMULATION (P14) ─────────────────────────────
 * Token-based money: discrete ErToken records with serial numbers and an
 * owner, fundamentally different from the account-based UPI/transfer ledger.
 * Denominations mirror physical cash.
 */

const DENOMS = [500, 200, 100, 50, 20, 10, 5, 2, 1]

function mintTokens(userId: string, amount: number): { serial: string; denomination: number }[] {
  let remaining = Math.floor(amount)
  const out: { serial: string; denomination: number }[] = []
  for (const d of DENOMS) {
    while (remaining >= d) {
      remaining -= d
      out.push({ serial: `E₹${d}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`, denomination: d })
    }
    if (remaining === 0) break
  }
  void userId
  return out
}

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const tokens = await prisma.erToken.findMany({
    where: { ownerId: p.userId, state: "WALLET" },
    orderBy: { denomination: "desc" },
  })
  const txns = await prisma.erWalletTxn.findMany({ where: { userId: p.userId }, orderBy: { createdAt: "desc" }, take: 12 })
  return NextResponse.json({
    balance: tokens.reduce((s, x) => s + x.denomination, 0),
    tokenCount: tokens.length,
    tokens,
    txns,
  })
}

/** POST { action: "load"|"redeem"|"p2p", amount?, toEmail? , accountId? } */
export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json()
    const action = String(body.action || "")
    const amount = Math.round(Number(body.amount) * 100) / 100
    if (!["load", "redeem", "p2p"].includes(action)) {
      return NextResponse.json({ error: "action must be load, redeem or p2p" }, { status: 400 })
    }
    if (!Number.isFinite(amount) || amount < 1 || Math.floor(amount) !== amount) {
      return NextResponse.json({ error: "Enter a whole rupee amount ≥ 1" }, { status: 400 })
    }

    // ── LOAD: bank account → wallet (mint tokens) ──
    if (action === "load") {
      const account = await prisma.account.findFirst({ where: { userId: p.userId, isActive: true }, orderBy: { createdAt: "asc" } })
      if (!account) return NextResponse.json({ error: "No active account" }, { status: 400 })
      if (account.balance < amount) return NextResponse.json({ error: "Insufficient bank balance" }, { status: 400 })

      const serials = mintTokens(p.userId, amount)
      await prisma.$transaction(async (tx) => {
        await tx.account.update({ where: { id: account.id }, data: { balance: { decrement: amount } } })
        for (const s of serials) {
          await tx.erToken.create({ data: { serial: s.serial, denomination: s.denomination, ownerId: p.userId, state: "WALLET" } })
        }
        await tx.erWalletTxn.create({ data: { userId: p.userId, kind: "LOAD", amount, tokenSerials: serials.map((s) => s.serial).join(","), counterparty: account.accountNumber.slice(-4) } })
        await tx.transaction.create({ data: { accountId: account.id, type: "DEBIT", amount: -amount, currency: "INR", status: "COMPLETED", category: "Other", description: "Loaded Digital Rupee (e₹) wallet", reference: `ERL${Date.now()}`, counterparty: "RBI e₹ (simulated)" } })
      })
      return NextResponse.json({ ok: true, loaded: amount, tokens: serials.length })
    }

    // Collect the caller's spendable tokens (largest first for redeem; any for p2p)
    const myTokens = await prisma.erToken.findMany({ where: { ownerId: p.userId, state: "WALLET" }, orderBy: { denomination: "desc" } })
    const myTotal = myTokens.reduce((s, x) => s + x.denomination, 0)
    if (myTotal < amount) {
      return NextResponse.json({ error: `Wallet holds only ₹${myTotal.toLocaleString("en-IN")} in e₹ tokens` }, { status: 400 })
    }

    // Pick tokens greedily to cover exactly the amount where possible
    const picked: typeof myTokens = []
    let acc = 0
    for (const tk of myTokens) {
      if (acc >= amount) break
      picked.push(tk); acc += tk.denomination
    }
    // Exact-change problem: e₹ in reality supports partial burning of a token;
    // we simulate change by burning over-selected value and re-minting change.
    const pickedValue = picked.reduce((s, x) => s + x.denomination, 0)
    const change = pickedValue - amount

    if (action === "redeem") {
      await prisma.$transaction(async (tx) => {
        for (const tk of picked) await tx.erToken.update({ where: { id: tk.id }, data: { state: "BURNED" } })
        if (change > 0) {
          for (const s of mintTokens(p.userId, change)) {
            await tx.erToken.create({ data: { serial: s.serial, denomination: s.denomination, ownerId: p.userId, state: "WALLET" } })
          }
        }
        const account = await prisma.account.findFirst({ where: { userId: p.userId, isActive: true }, orderBy: { createdAt: "asc" } })
        if (!account) throw new Error("NO_ACCOUNT")
        await tx.account.update({ where: { id: account.id }, data: { balance: { increment: amount } } })
        await tx.erWalletTxn.create({ data: { userId: p.userId, kind: "REDEEM", amount, tokenSerials: picked.map((x) => x.serial).join(","), counterparty: account.accountNumber.slice(-4) } })
        await tx.transaction.create({ data: { accountId: account.id, type: "CREDIT", amount, currency: "INR", status: "COMPLETED", category: "Other", description: "Redeemed Digital Rupee (e₹) to account", reference: `ERR${Date.now()}`, counterparty: "RBI e₹ (simulated)" } })
      })
      return NextResponse.json({ ok: true, redeemed: amount, changeIssued: change })
    }

    // ── P2P ──
    const toEmail = String(body.toEmail || "").trim().toLowerCase()
    if (!toEmail) return NextResponse.json({ error: "toEmail required for P2P transfer" }, { status: 400 })
    const target = await prisma.user.findUnique({ where: { email: toEmail }, select: { id: true } })
    if (!target || target.id === p.userId) return NextResponse.json({ error: "Recipient not found" }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      for (const tk of picked) {
        await tx.erToken.update({ where: { id: tk.id }, data: { ownerId: target.id } })
      }
      if (change > 0) {
        for (const s of mintTokens(p.userId, change)) {
          await tx.erToken.create({ data: { serial: s.serial, denomination: s.denomination, ownerId: p.userId, state: "WALLET" } })
        }
        for (const s of mintTokens(target.id, change)) {
          await tx.erToken.create({ data: { serial: s.serial, denomination: s.denomination, ownerId: target.id, state: "WALLET" } })
        }
      }
      await tx.erWalletTxn.createMany({
        data: [
          { userId: p.userId, kind: "P2P_OUT", amount, counterparty: toEmail, tokenSerials: picked.map((x) => x.serial).join(",") },
          { userId: target.id, kind: "P2P_IN", amount, counterparty: `user:${p.userId.slice(-6)}`, tokenSerials: picked.map((x) => x.serial).join(",") },
        ],
      })
    })
    return NextResponse.json({ ok: true, sent: amount, to: toEmail })
  } catch (e) {
    console.error("er wallet failed:", e)
    return NextResponse.json({ error: "Wallet operation failed" }, { status: 500 })
  }
}