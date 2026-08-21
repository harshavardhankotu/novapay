import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getSlot } from "@/config/affiliate"

// Tracked affiliate redirect: /api/affiliate/[id]
// Logs the click (with user if logged in) then 302s to the partner URL.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const slot = getSlot(id)
  if (!slot) return NextResponse.json({ error: "Unknown offer" }, { status: 404 })

  try {
    const token = getTokenFromCookies(request)
    const payload = token ? verifyToken(token) : null
    await prisma.affiliateClick.create({
      data: {
        slotId: id,
        userId: payload?.userId ?? null,
        referer: request.headers.get("referer")?.slice(0, 500) ?? null,
      },
    })
  } catch {
    // Never block the redirect because logging failed
  }

  return NextResponse.redirect(slot.url, { status: 302 })
}