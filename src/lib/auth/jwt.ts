import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "novapay-dev-secret-2026"
const TOKEN_EXPIRY = "7d"

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET is not set — using insecure development fallback. Set JWT_SECRET before deploying to production!")
}

export type JwtPayload = {
  userId: string
  email: string
  name: string
  role: "USER" | "ADMIN"
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function getTokenFromCookies(request: Request): string | null {
  const cookie = request.headers.get("cookie") || ""
  const match = cookie.match(/token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export function setTokenCookie(response: Response, token: string): void {
  response.headers.set(
    "Set-Cookie",
    `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
  )
}

export function clearTokenCookie(response: Response): void {
  response.headers.set(
    "Set-Cookie",
    "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
  )
}
