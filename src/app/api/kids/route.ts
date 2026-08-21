import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const kids = await prisma.kidsAccount.findMany({ where: { parentId: p.userId } })
  return NextResponse.json(kids)
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { name, age, weeklyAllowance } = await request.json()
  const kid = await prisma.kidsAccount.create({
    data: { parentId: p.userId, name, age: age || 10, weeklyAllowance: weeklyAllowance || 500 },
  })
  return NextResponse.json(kid)
}

export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, action, balance, weeklyAllowance, isOnlineBlocked } = await request.json()
  const data: any = {}
  if (action === "freeze") data.cardStatus = "FROZEN"
  if (action === "unfreeze") data.cardStatus = "ACTIVE"
  if (balance !== undefined) data.balance = balance
  if (weeklyAllowance) data.weeklyAllowance = weeklyAllowance
  if (isOnlineBlocked !== undefined) data.isOnlineBlocked = isOnlineBlocked
  await prisma.kidsAccount.updateMany({ where: { id, parentId: p.userId }, data })
  return NextResponse.json({ success: true })
}
