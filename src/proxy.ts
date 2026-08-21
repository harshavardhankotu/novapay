import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

const publicPaths = [
  "/login",
  "/signup",
  "/forgot-password",
  "/",
  "/privacy",
  "/terms",
  "/compliance",
  "/pricing",
  "/docs",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/demo",
]
const adminPaths = ["/admin"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))
  const isApi = pathname.startsWith("/api/")
  const isStatic = pathname.startsWith("/_next/") || pathname === "/favicon.ico"

  if (isPublic || isStatic) return NextResponse.next()

  const tokenCookie = request.cookies.get("token")?.value
  if (!tokenCookie) {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const payload = verifyToken(tokenCookie)
  if (!payload) {
    if (isApi) return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (adminPaths.some((p) => pathname.startsWith(p)) && payload.role !== "ADMIN") {
    if (isApi) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
