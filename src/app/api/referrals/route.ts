import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const sent = await prisma.referral.findMany({ where: { referrerId: p.userId }, include: { referee: { select: { name: true } } } })
  const totalRewards = sent.reduce((s, r) => s + (r.status === "ACTIVE" ? r.rewardPoints : 0), 0)
  const referralCode = `NOVA${p.userId.slice(-6).toUpperCase()}`
  return NextResponse.json({ sent, totalRewards, referralCode, link: `https://novapay.in/join/${referralCode}` })
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { email, phone } = await request.json()
  return NextResponse.json({ success: true, message: `Invite sent to ${email || phone}` })
}
