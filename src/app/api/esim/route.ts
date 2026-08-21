import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const esims = await prisma.esimPackage.findMany({ where: { userId: p.userId } })
  return NextResponse.json(esims)
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { region, data, validity, price } = await request.json()
  const esim = await prisma.esimPackage.create({
    data: { userId: p.userId, region, data, validity, price },
  })
  return NextResponse.json(esim)
}

export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await request.json()
  await prisma.esimPackage.updateMany({ where: { id, userId: p.userId }, data: { isPurchased: true } })
  return NextResponse.json({ success: true })
}
