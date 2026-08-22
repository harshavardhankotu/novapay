import { NextResponse } from "next/server"
import { signToken, setTokenCookie } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { seedDemoUser, ensureAdminUser, ensureRateSlabs, DEMO_EMAIL } from "@seed-data"

// Instant demo: ensures the seeded account exists, then issues a real
// session for it. No signup, no password — powers the "Try Live Demo" CTA.
export async function POST() {
  try {
    let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } })
    if (!user) {
      await seedDemoUser(prisma as any)
      await ensureAdminUser(prisma as any)
      await ensureRateSlabs(prisma as any)
      user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } })
    } else {
      await ensureRateSlabs(prisma as any)
    }
    if (!user) {
      return NextResponse.json({ error: "Demo unavailable. Run `npm run seed`." }, { status: 503 })
    }
    if (user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Demo account disabled" }, { status: 403 })
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name, role: (user as any).role || "USER" })
    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, kycLevel: user.kycLevel, status: user.status },
      demo: true,
    })
    setTokenCookie(response, token)
    return response
  } catch {
    return NextResponse.json({ error: "Failed to start demo" }, { status: 500 })
  }
}