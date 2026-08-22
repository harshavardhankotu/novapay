import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

  const slabs = await prisma.rateSlab.findMany({
    orderBy: [{ product: "asc" }, { effectiveFrom: "desc" }],
  })
  // Group into active vs retired for the UI
  const now = new Date()
  return NextResponse.json({
    active: slabs.filter((s) => !s.retiredAt || s.retiredAt > now),
    retired: slabs.filter((s) => s.retiredAt && s.retiredAt <= now),
  })
}

/**
 * POST creates a new slab version. Any currently-active slabs covering the
 * same product (+tenure when provided) are retired with a timestamp, so the
 * full rate history remains queryable.
 */
export async function POST(request: Request) {
  const guard = await requireAdmin(request)
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  try {
    const body = await request.json()
    const product = typeof body.product === "string" ? body.product.trim().toUpperCase() : ""
    const minAmount = Number(body.minAmount)
    const maxAmount = body.maxAmount == null || body.maxAmount === "" ? null : Number(body.maxAmount)
    const tenureMonths = body.tenureMonths == null || body.tenureMonths === "" ? null : parseInt(body.tenureMonths, 10)
    const rate = Number(body.rate)

    if (!["FD", "RD", "SAVINGS"].includes(product)) {
      return NextResponse.json({ error: "product must be FD, RD or SAVINGS" }, { status: 400 })
    }
    if (!Number.isFinite(minAmount) || minAmount < 0) {
      return NextResponse.json({ error: "minAmount invalid" }, { status: 400 })
    }
    if (maxAmount != null && (!Number.isFinite(maxAmount) || maxAmount <= minAmount)) {
      return NextResponse.json({ error: "maxAmount must be greater than minAmount" }, { status: 400 })
    }
    if (!Number.isFinite(rate) || rate <= 0 || rate > 20) {
      return NextResponse.json({ error: "rate must be between 0 and 20" }, { status: 400 })
    }

    const now = new Date()
    // Retire overlapping active slabs of the same product
    const active = await prisma.rateSlab.findMany({
      where: { product, OR: [{ retiredAt: null }, { retiredAt: { gt: now } }] },
    })
    for (const s of active) {
      const overlapsTenure = tenureMonths == null || s.tenureMonths == null || s.tenureMonths === tenureMonths
      const overlapsAmount =
        maxAmount == null || s.minAmount == null
          ? true
          : s.minAmount < (maxAmount ?? Infinity) && (s.maxAmount ?? Infinity) > minAmount
      if (overlapsTenure && overlapsAmount) {
        await prisma.rateSlab.update({ where: { id: s.id }, data: { retiredAt: now } })
      }
    }

    const created = await prisma.rateSlab.create({
      data: { product, minAmount, maxAmount, tenureMonths, rate, effectiveFrom: now },
    })
    return NextResponse.json(created)
  } catch {
    return NextResponse.json({ error: "Could not save slab" }, { status: 500 })
  }
}