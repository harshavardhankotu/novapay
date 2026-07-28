import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

  return NextResponse.json({ ...user, documents: docs })
}

export async function POST(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const { aadhaar, pan } = await request.json()

  if (aadhaar) {
    await prisma.user.update({ where: { id: payload.userId }, data: { aadhaar } })
    await prisma.kycDocument.create({
      data: { userId: payload.userId, type: "AADHAAR", status: "VERIFIED" },
    })
  }

  if (pan) {
    await prisma.user.update({ where: { id: payload.userId }, data: { pan } })
    await prisma.kycDocument.create({
      data: { userId: payload.userId, type: "PAN", status: "VERIFIED" },
    })
  }

  const docCount = await prisma.kycDocument.count({
    where: { userId: payload.userId, status: "VERIFIED" },
  })

  if (docCount >= 2) {
    await prisma.user.update({
      where: { id: payload.userId },
      data: { kycLevel: "FULL" },
    })
  } else if (docCount >= 1) {
    await prisma.user.update({
      where: { id: payload.userId },
      data: { kycLevel: "MINIMAL" },
    })
  }

  return NextResponse.json({ success: true, kycLevel: docCount >= 2 ? "FULL" : docCount >= 1 ? "MINIMAL" : "UNVERIFIED" })
}
