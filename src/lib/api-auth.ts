import { createHash, createHmac, randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"

export const API_SCOPES = ["accounts.read", "balance.read", "transfers.write", "mandates.write"] as const
export type ApiScope = (typeof API_SCOPES)[number]

export function hashKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex")
}

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = `npk_${randomBytes(24).toString("hex")}`
  return { raw, hash: hashKey(raw), prefix: raw.slice(0, 12) }
}

/** Deterministic HMAC-SHA256 signature for webhook deliveries. */
export function signWebhook(secret: string, body: string, timestamp: number): string {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")
}

// ── Per-key in-memory rate limiter (mirrors lib/rate-limit pattern) ──────────
const buckets = new Map<string, { count: number; resetAt: number }>()

export function checkKeyRateLimit(keyId: string, ratePerMin: number): boolean {
  const now = Date.now()
  const b = buckets.get(keyId)
  if (!b || now > b.resetAt) {
    buckets.set(keyId, { count: 1, resetAt: now + 60000 })
    return true
  }
  if (b.count >= ratePerMin) return false
  b.count++
  return true
}

// ── Request authentication ───────────────────────────────────────────────────

export interface ApiContext {
  keyId: string
  userId: string
  scopes: Set<string>
}

/**
 * Resolves X-API-Key → an authenticated context, enforcing:
 * active key → rate limit → requested scope.
 * Returns either a context or a structured error.
 */
export async function authenticateApiKey(
  request: Request,
  requiredScope: ApiScope
): Promise<{ ctx?: ApiContext; error?: string; status?: number }> {
  const raw = request.headers.get("x-api-key")
  if (!raw) return { error: "Missing X-API-Key header", status: 401 }

  const key = await prisma.apiKey.findUnique({ where: { keyHash: hashKey(raw) } })
  if (!key || !key.active) return { error: "Invalid or disabled API key", status: 401 }
  if (!checkKeyRateLimit(key.id, key.ratePerMin)) {
    return { error: "Rate limit exceeded for this key", status: 429 }
  }

  const scopes = new Set(key.scopes.split(",").map((s) => s.trim()))
  if (!scopes.has(requiredScope)) {
    return { error: `Key lacks required scope: ${requiredScope}`, status: 403 }
  }

  await prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } }).catch(() => {})
  await prisma.apiRequestLog
    .create({ data: { apiKeyId: key.id, method: request.method, path: new URL(request.url).pathname, status: 200 } })
    .catch(() => {})

  return { ctx: { keyId: key.id, userId: key.userId, scopes } }
}