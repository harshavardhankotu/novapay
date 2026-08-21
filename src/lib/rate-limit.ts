const rateMap = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(key: string, maxRequests: number = 60, windowMs: number = 60000): boolean {
  const now = Date.now()
  const entry = rateMap.get(key)
  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= maxRequests) return false
  entry.count++
  return true
}

export function rateLimitMiddleware(request: Request): Response | null {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } })
  }
  return null
}
