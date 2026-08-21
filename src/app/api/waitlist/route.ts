import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(request: Request) {
  try {
    const { email, source } = await request.json()
    const clean = typeof email === "string" ? email.trim().toLowerCase() : ""
    if (!EMAIL_RE.test(clean) || clean.length > 254) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 })
    }

    try {
      const entry = await prisma.waitlistEntry.create({
        data: { email: clean, source: typeof source === "string" ? source.slice(0, 40) : "landing" },
      })
      return NextResponse.json({ ok: true, position: await prisma.waitlistEntry.count() })
    } catch (err: any) {
      // P2002 = unique violation => already subscribed; anything else is a real failure
      if (err?.code === "P2002") {
        return NextResponse.json({ ok: true, alreadySubscribed: true })
      }
      console.error("waitlist insert failed:", err)
      return NextResponse.json({ error: "Could not join right now. Try again." }, { status: 500 })
    }
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}