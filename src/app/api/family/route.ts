import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const members = await prisma.familyParent.findMany({
    where: { parentId: payload.userId },
    include: { child: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(members)
}

export async function POST(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const { childEmail, dailyLimit, monthlyLimit } = await request.json()

  const child = await prisma.user.findUnique({ where: { email: childEmail } })
  if (!child) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const existing = await prisma.familyParent.findFirst({
    where: { parentId: payload.userId, childId: child.id },
  })
  if (existing) return NextResponse.json({ error: "Already a family member" }, { status: 409 })

  const member = await prisma.familyParent.create({
    data: {
      parentId: payload.userId,
      childId: child.id,
      dailyLimit: dailyLimit || 5000,
      monthlyLimit: monthlyLimit || 50000,
    },
    include: { child: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(member)
}

export async function PATCH(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const { id, action, dailyLimit, monthlyLimit } = await request.json()

  const update: any = {}
  if (action === "freeze") update.isActive = false
  if (action === "unfreeze") update.isActive = true
  if (dailyLimit) update.dailyLimit = dailyLimit
  if (monthlyLimit) update.monthlyLimit = monthlyLimit

  const existingMember = await prisma.familyParent.findFirst({
    where: { id, parentId: payload.userId },
  })
  if (!existingMember) return NextResponse.json({ error: "Family member not found" }, { status: 404 })

  const member = await prisma.familyParent.update({
    where: { id },
    data: update,
    include: { child: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(member)
}
