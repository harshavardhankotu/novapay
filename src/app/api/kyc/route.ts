import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { validateAadhaar, validatePan, generateOtp, maskAadhaar } from "@/lib/validation"
import { prisma } from "@/lib/prisma"

// In-memory DigiLocker OTP store: userId -> { code, expiresAt, aadhaar }
const aadhaarOtpStore = new Map<string, { code: string; expiresAt: number; aadhaar: string }>()
const OTP_TTL_MS = 5 * 60 * 1000

export async function GET(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { kycLevel: true, aadhaar: true, pan: true },
  })

  const docs = await prisma.kycDocument.findMany({ where: { userId: payload.userId } })

  return NextResponse.json({
    ...user,
    aadhaarMasked: user?.aadhaar ? maskAadhaar(user.aadhaar) : null,
    documents: docs,
  })
}

// Step 1 of Aadhaar eKYC (DigiLocker flow): send OTP to Aadhaar-linked mobile
export async function PUT(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const { aadhaar } = await request.json()
  if (!aadhaar || !validateAadhaar(aadhaar)) {
    return NextResponse.json({ error: "Invalid Aadhaar number. Check the 12 digits and try again." }, { status: 400 })
  }

  // Already verified by another account? (Aadhaar is unique per person)
  const existing = await prisma.user.findFirst({
    where: { aadhaar: aadhaar.replace(/[\s-]/g, ""), NOT: { id: payload.userId } },
    select: { id: true },
  })
  if (existing) {
    return NextResponse.json({ error: "This Aadhaar is already linked to another NovaPay account." }, { status: 409 })
  }

  const code = generateOtp()
  aadhaarOtpStore.set(payload.userId, { code, expiresAt: Date.now() + OTP_TTL_MS, aadhaar })

  // Demo mode: UIDAI sandbox would send this to the Aadhaar-registered mobile.
  return NextResponse.json({
    otpSent: true,
    maskedAadhaar: maskAadhaar(aadhaar),
    expiresInSeconds: OTP_TTL_MS / 1000,
    demoOtp: code,
  })
}

export async function POST(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const body = await request.json()
  const { pan, otpCode } = body
  const cleanPan = typeof pan === "string" ? pan.trim().toUpperCase() : null

  if (cleanPan) {
    if (!validatePan(cleanPan)) {
      return NextResponse.json({ error: "Invalid PAN format. Expected ABCDE1234F." }, { status: 400 })
    }
    const existing = await prisma.user.findFirst({
      where: { pan: cleanPan, NOT: { id: payload.userId } },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json({ error: "This PAN is already linked to another NovaPay account." }, { status: 409 })
    }
  }

  let verifiedAadhaar: string | null = null

  if (otpCode) {
    const record = aadhaarOtpStore.get(payload.userId)
    if (!record) return NextResponse.json({ error: "Request an Aadhaar OTP first." }, { status: 400 })
    if (record.expiresAt < Date.now()) {
      aadhaarOtpStore.delete(payload.userId)
      return NextResponse.json({ error: "OTP expired. Request a new one." }, { status: 400 })
    }
    if (record.code !== otpCode.toString().trim()) {
      return NextResponse.json({ error: "Incorrect OTP. Please try again." }, { status: 400 })
    }
    aadhaarOtpStore.delete(payload.userId)
    verifiedAadhaar = record.aadhaar
  }

  if (verifiedAadhaar) {
    await prisma.user.update({ where: { id: payload.userId }, data: { aadhaar: verifiedAadhaar } })
    await prisma.kycDocument.createMany({
      data: [{ userId: payload.userId, type: "AADHAAR", status: "VERIFIED" }],
    })
  }

  if (cleanPan) {
    await prisma.user.update({ where: { id: payload.userId }, data: { pan: cleanPan } })
    await prisma.kycDocument.createMany({
      data: [{ userId: payload.userId, type: "PAN", status: "VERIFIED" }],
    })
  }

  const docCount = await prisma.kycDocument.count({
    where: { userId: payload.userId, status: "VERIFIED" },
  })

  if (docCount >= 2) {
    await prisma.user.update({ where: { id: payload.userId }, data: { kycLevel: "FULL" } })
  } else if (docCount >= 1) {
    await prisma.user.update({ where: { id: payload.userId }, data: { kycLevel: "MINIMAL" } })
  }

  return NextResponse.json({
    success: true,
    kycLevel: docCount >= 2 ? "FULL" : docCount >= 1 ? "MINIMAL" : "UNVERIFIED",
    aadhaarVerified: !!verifiedAadhaar,
    panVerified: !!cleanPan,
    aadhaarMasked: verifiedAadhaar ? maskAadhaar(verifiedAadhaar) : undefined,
  })
}