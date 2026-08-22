import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json(await prisma.standingInstruction.findMany({
    where: { userId: p.userId },
    orderBy: { nextRun: "asc" },
  }))
}

/** POST — recurring SELF-transfer sweep between own accounts. */
export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json()
    const fromAccountId = String(body.fromAccountId || "")
    const toAccountNumber = String(body.toAccountNumber || "").trim()
    const amount = Math.round(Number(body.amount) * 100) / 100
    const dayOfMonth = parseInt(body.dayOfMonth, 10)
    const note = typeof body.note === "string" ? body.note.slice(0, 80) : null

    if (!fromAccountId || !toAccountNumber || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "fromAccountId, toAccountNumber and amount required" }, { status: 400 })
    }
    if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 28) {
      return NextResponse.json({ error: "dayOfMonth must be 1–28 (skips short-month edge cases)" }, { status: 400 })
    }
    const owned = await prisma.account.findFirst({ where: { id: fromAccountId, userId: p.userId } })
    if (!owned) return NextResponse.json({ error: "Source account not found" }, { status: 404 })
    // Self-transfer only: destination must be an account number the user owns
    const dest = await prisma.account.findUnique({ where: { accountNumber: toAccountNumber } })
    if (!dest || dest.userId !== p.userId) {
      return NextResponse.json({ error: "Standing instructions support transfers between YOUR OWN accounts. For third parties use mandates." }, { status: 400 })
    }

    const next = new Date()
    next.setDate(Math.min(dayOfMonth, 28))
    if (next <= new Date()) next.setMonth(next.getMonth() + 1)

    const si = await prisma.standingInstruction.create({
      data: { userId: p.userId, fromAccountId, toAccountNumber, amount, dayOfMonth, note, nextRun: next },
    })
    return NextResponse.json(si)
  } catch {
    return NextResponse.json({ error: "Could not create standing instruction" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = new URL(request.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id query param required" }, { status: 400 })
  const r = await prisma.standingInstruction.deleteMany({ where: { id, userId: p.userId } })
  if (r.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}