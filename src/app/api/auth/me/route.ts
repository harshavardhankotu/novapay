import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const token = getTokenFromCookies(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        accounts: { include: { cards: true } },
        rewards: true,
      },
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      kycLevel: user.kycLevel,
      status: user.status,
      accounts: user.accounts,
      rewards: user.rewards,
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
