import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const disputes = await prisma.disputeTicket.findMany({ where: { userId: p.userId }, orderBy: { createdAt: "desc" } })
  return NextResponse.json(disputes)
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { merchant, amount, reason } = await request.json()
  const npciRef = `NPCI${Math.floor(100000 + Math.random() * 900000)}`
  const dispute = await prisma.disputeTicket.create({
    data: { userId: p.userId, merchant, amount, reason, npciRef },
  })
  return NextResponse.json(dispute)
}
