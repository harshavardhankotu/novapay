import { NextResponse } from "next/server"
import { signToken, hashPassword, setTokenCookie } from "@/lib/auth"
import { normalizeIndianPhone } from "@/lib/validation"
import { audit } from "@/lib/banking"
import { screenOnboarding } from "@/lib/compliance"
import { prisma } from "@/lib/prisma"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(request: Request) {
  try {
    const raw = await request.json()
    const name = typeof raw.name === "string" ? raw.name.trim() : ""
    const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : ""
    const rawPhone = typeof raw.phone === "string" ? raw.phone : ""
    const phone = normalizeIndianPhone(rawPhone) || ""
    const password = typeof raw.password === "string" ? raw.password : ""

    if (!name || !email || !rawPhone || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 })
    }
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 })
    }
    if (!phone) {
      return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number" }, { status: 400 })
    }
    if (password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: "Password must be between 8 and 128 characters" }, { status: 400 })
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    })

    if (existing) {
      return NextResponse.json({ error: "Email or phone already registered" }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    // Ensure a unique UPI handle even when two people share an email prefix
    let upiHandle = `${email.split("@")[0].replace(/[^a-z0-9]/g, "")}@novapay`
    if (await prisma.account.findUnique({ where: { upiHandle } })) {
      upiHandle = `${upiHandle.split("@")[0]}${Date.now().toString().slice(-5)}@novapay`
    }

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
            accountNumber: `NOVAINR${Date.now().toString().slice(-8)}`,
            ifsc: "NOVA0000001",
            upiHandle,
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

    await audit(user.id, "SIGNUP", `Account created for ${email}`)
    // AML/sanctions screening at onboarding (simulated watchlist)
    await screenOnboarding(user.id, name).catch(() => {})

    // ── Referral completion: link referee → referrer, reward both sides ──
    const refCode = typeof raw.referralCode === "string" ? raw.referralCode.trim().toUpperCase() : ""
    if (refCode.startsWith("NOVA") && refCode.length > 4) {
      try {
        // Code format is NOVA + last-6-of-id (see /api/referrals)
        const candidates = await prisma.user.findMany({
          where: { id: { endsWith: refCode.slice(4).toLowerCase() }, NOT: { id: user.id } },
          select: { id: true },
          take: 2,
        })
        if (candidates.length === 1) {
          const referrerId = candidates[0].id
          await prisma.referral.create({
            data: { referrerId, refereeId: user.id, code: refCode, rewardPoints: 500, status: "ACTIVE" },
          })
          // Referrer bonus (+500)
          try {
            await prisma.reward.update({ where: { userId: referrerId }, data: { points: { increment: 500 } } })
          } catch {
            await prisma.reward.create({ data: { userId: referrerId, points: 500, tier: "SILVER", cashback: 0 } })
          }
          // New user welcome bonus (+250)
          try {
            await prisma.reward.update({ where: { userId: user.id }, data: { points: { increment: 250 } } })
          } catch {}
        }
      } catch {
        // referral must never block signup
      }
    }

    setTokenCookie(response, token)
    return response
  } catch (error) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
}
