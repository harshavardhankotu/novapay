import { NextResponse } from "next/server"
import { signToken, hashPassword, setTokenCookie } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json()

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    })

    if (existing) {
      return NextResponse.json({ error: "Email or phone already registered" }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        accounts: {
          create: {
            type: "SAVINGS",
            balance: 1000,
            currency: "INR",
            accountNumber: `REVINR${Date.now().toString().slice(-8)}`,
            ifsc: "REVU0000001",
            upiHandle: `${email.split("@")[0]}@revolut`,
          },
        },
        rewards: {
          create: {
            points: 100,
            tier: "SILVER",
            cashback: 0,
          },
        },
      },
      include: { accounts: true, rewards: true },
    })

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: "USER",
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        kycLevel: user.kycLevel,
        status: user.status,
        account: user.accounts[0],
        rewards: user.rewards[0],
      },
    })

    setTokenCookie(response, token)
    return response
  } catch (error) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
}
