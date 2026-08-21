import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const policies = await prisma.insurancePolicy.findMany({ where: { userId: p.userId } })
  return NextResponse.json(policies)
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { type, provider, sumAssured, premium, nominee } = await request.json()
  const policy = await prisma.insurancePolicy.create({
    data: { userId: p.userId, type: type || "HEALTH", provider, policyNumber: `POL${Date.now()}`, sumAssured, premium, startDate: new Date(), endDate: new Date(Date.now() + 365 * 86400000), nominee },
  })
  return NextResponse.json(policy)
}
