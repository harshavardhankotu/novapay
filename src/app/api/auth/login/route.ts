import { NextResponse } from "next/server"
import { signToken, verifyPassword, setTokenCookie } from "@/lib/auth"
import { generateOtp, normalizeIndianPhone } from "@/lib/validation"
import { checkRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { audit } from "@/lib/banking"

// In-memory OTP store: ticket -> { userId, code, expiresAt, attempts }
const otpStore = new Map<string, { userId: string; code: string; expiresAt: number; attempts: number }>()
const OTP_TTL_MS = 5 * 60 * 1000
const MAX_ATTEMPTS = 5

// Periodic cleanup
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of otpStore) if (v.expiresAt < now) otpStore.delete(k)
}, 60 * 1000).unref?.()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const identifierRaw = (body.email || body.identifier || "").toString().trim()
    const password = (body.password || "").toString()
    const otpCode = body.otpCode ? body.otpCode.toString().trim() : null
    const ticket = body.ticket ? body.ticket.toString() : null

    if (!identifierRaw || !password) {
      return NextResponse.json({ error: "Email/phone and password required" }, { status: 400 })
    }

    // Brute-force guard: max 8 credential submissions per minute per IP+identifier.
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local"
    if (!checkRateLimit(`login:${ip}:${identifierRaw.toLowerCase()}`, 8, 60_000)) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a minute and try again." },
        { status: 429, headers: { "Retry-After": "60" } }
      )
    }

    // Identifier can be an email OR a 10-digit Indian phone
    let user = null
    if (identifierRaw.includes("@")) {
      user = await prisma.user.findUnique({ where: { email: identifierRaw.toLowerCase() } })
    } else {
      const phone = normalizeIndianPhone(identifierRaw)
      if (!phone) return NextResponse.json({ error: "Enter a valid email or 10-digit Indian mobile number" }, { status: 400 })
      user = await prisma.user.findUnique({ where: { phone } })
    }

    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    if (user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Account is suspended or closed" }, { status: 403 })
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    // Step 2: verify the OTP for an existing ticket
    if (ticket) {
      const record = otpStore.get(ticket)
      if (!record || record.userId !== user.id) {
        return NextResponse.json({ error: "Verification session expired. Please log in again." }, { status: 400 })
      }
      if (record.expiresAt < Date.now()) {
        otpStore.delete(ticket)
        return NextResponse.json({ error: "OTP expired. Please log in again." }, { status: 400 })
      }
      if (record.attempts >= MAX_ATTEMPTS) {
        otpStore.delete(ticket)
        return NextResponse.json({ error: "Too many incorrect attempts. Please log in again." }, { status: 429 })
      }
      if (record.code !== otpCode) {
        record.attempts += 1
        return NextResponse.json({ error: `Incorrect OTP. ${MAX_ATTEMPTS - record.attempts} attempts left.` }, { status: 400 })
      }
      otpStore.delete(ticket)
      await audit(user.id, "LOGIN_SUCCESS", `OTP login via ${identifierRaw.includes("@") ? "email" : "SMS"}`)

      const token = signToken({ userId: user.id, email: user.email, name: user.name, role: (user as any).role || "USER" })
      const response = NextResponse.json({
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, kycLevel: user.kycLevel, status: user.status },
      })
      setTokenCookie(response, token)
      return response
    }

    // Step 1: credentials valid -> issue OTP challenge
    const code = generateOtp()
    const newTicket = crypto.randomUUID()
    otpStore.set(newTicket, { userId: user.id, code, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 })

    const isPhoneLogin = !identifierRaw.includes("@")
    const contact = isPhoneLogin
      ? `+91 ${user.phone.slice(0, 2)}XXX XXX${user.phone.slice(-3)}`
      : `${user.email.slice(0, 2)}***${user.email.slice(user.email.indexOf("@"))}`

    // Demo mode: no SMS/email provider configured, so the OTP is returned
    // so the flow stays testable. In production, send via provider instead.
    return NextResponse.json({
      requiresOtp: true,
      ticket: newTicket,
      method: isPhoneLogin ? "sms" : "email",
      maskedContact: contact,
      expiresInSeconds: OTP_TTL_MS / 1000,
      demoOtp: code,
    })
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}