import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateApiKey, API_SCOPES } from "@/lib/api-auth"

async function requireAdmin(request: Request) {
  const t = getTokenFromCookies(request)
  const p = t ? verifyToken(t) : null
  if (!p || p.role !== "ADMIN") return null
  return p
}

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const keys = await prisma.apiKey.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, prefix: true, scopes: true, ratePerMin: true, active: true, lastUsedAt: true, userId: true },
  })
  const logs = await prisma.apiRequestLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 })
  const webhooks = await prisma.webhookRegistration.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json({ keys, logs, webhooks, availableScopes: API_SCOPES })
}

/** POST — create a key. Raw key is returned ONCE. */
export async function POST(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  try {
    const body = await request.json()
    const name = String(body.name || "").trim().slice(0, 40)
    const scopes = Array.isArray(body.scopes) ? body.scopes.filter((s: string) => (API_SCOPES as readonly string[]).includes(s)) : []
    const ratePerMin = Math.max(1, Math.min(600, parseInt(body.ratePerMin, 10) || 30))
    const userId = String(body.userId || "")
    if (!name || scopes.length === 0 || !userId) {
      return NextResponse.json({ error: "name, userId and at least one scope required" }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (!user) return NextResponse.json({ error: "userId not found" }, { status: 404 })

    const { raw, hash, prefix } = generateApiKey()
    const created = await prisma.apiKey.create({
      data: { name, userId, keyHash: hash, prefix, scopes: scopes.join(","), ratePerMin },
    })
    return NextResponse.json({ ...created, rawKey: raw }) // only time the raw key is visible
  } catch {
    return NextResponse.json({ error: "Key creation failed" }, { status: 500 })
  }
}

/** PATCH — toggle active / delete. */
export async function PATCH(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const body = await request.json()
  if (body.action === "delete") {
    await prisma.apiKey.delete({ where: { id: String(body.id) } }).catch(() => {})
    return NextResponse.json({ ok: true, deleted: true })
  }
  const updated = await prisma.apiKey.update({
    where: { id: String(body.id) },
    data: { active: !!body.active },
  }).catch(() => null)
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true, active: updated.active })
}