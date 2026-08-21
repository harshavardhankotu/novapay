import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  let score = await prisma.creditScore.findUnique({ where: { userId_bureau: { userId: p.userId, bureau: "CIBIL" } } })
  if (!score) {
    score = await prisma.creditScore.create({
      data: { userId: p.userId, bureau: "CIBIL", score: Math.floor(650 + Math.random() * 200), scoreRange: "300-900" },
    })
  }
  const factors = { paymentHistory: 35, creditUtilization: 30, creditAge: 15, inquiries: 10, mix: 10 }
  return NextResponse.json({ ...score, factors })
}
