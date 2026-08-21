import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const list = await prisma.beneficiary.findMany({
    where: { userId: p.userId },
    orderBy: [{ isFavourite: "desc" }, { createdAt: "desc" }],
  })
  return NextResponse.json(list)
}

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const accountNumber = typeof body.accountNumber === "string" ? body.accountNumber.trim() : ""
    const upiId = typeof body.upiId === "string" ? body.upiId.trim().toLowerCase() : ""
    const ifsc = typeof body.ifsc === "string" ? body.ifsc.trim().toUpperCase() : ""

    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })
    if (!accountNumber && !upiId) {
      return NextResponse.json({ error: "Account number or UPI ID required" }, { status: 400 })
    }
    if (accountNumber && !/^[A-Za-z0-9]{6,24}$/.test(accountNumber)) {
      return NextResponse.json({ error: "Invalid account number" }, { status: 400 })
    }
    if (upiId && !upiId.includes("@")) {
      return NextResponse.json({ error: "UPI ID must look like name@bank" }, { status: 400 })
    }

    // Duplicate check
    const dupe = await prisma.beneficiary.findFirst({
      where: {
        userId: p.userId,
        ...(upiId ? { upiId } : { accountNumber }),
      },
    })
    if (dupe) return NextResponse.json({ error: "Beneficiary already added" }, { status: 409 })

    const created = await prisma.beneficiary.create({
      data: {
        userId: p.userId,
        name,
        type: upiId ? "UPI" : "BANK",
        ...(upiId ? { upiId } : { accountNumber, ifsc: ifsc || undefined }),
      },
    })
    return NextResponse.json(created)
  } catch {
    return NextResponse.json({ error: "Could not add beneficiary" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const result = await prisma.beneficiary.deleteMany({ where: { id, userId: p.userId } })
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}