import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const SLA_FIRST_RESPONSE_H = 24
const SLA_RESOLUTION_H = 72

function slaFlags(t: { createdAt: Date; firstResponseAt: Date | null; resolutionAt: Date | null }) {
  const ageH = (Date.now() - t.createdAt.getTime()) / 3600000
  return {
    firstResponseHours: SLA_FIRST_RESPONSE_H,
    resolutionHours: SLA_RESOLUTION_H,
    firstResponseBreached: !t.firstResponseAt && ageH > SLA_FIRST_RESPONSE_H,
    resolutionBreached: !t.resolutionAt && ageH > SLA_RESOLUTION_H,
  }
}

/** GET — user's own tickets, or the full SLA queue for admins. */
export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const tickets = await prisma.supportTicket.findMany({
    where: p.role === "ADMIN" ? {} : { userId: p.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { messages: { orderBy: { createdAt: "asc" } } },
  })

  return NextResponse.json(
    tickets.map((tk) => {
      // First admin message = time-to-first-response
      const adminMsg = tk.messages.find((m) => m.senderId !== tk.userId)
      void adminMsg
      const enriched = {
        ...tk,
        firstResponseAt: (tk as any).firstResponseAt ?? null,
        resolutionAt: (tk as any).resolutionAt ?? null,
        sla: slaFlags({
          createdAt: tk.createdAt,
          firstResponseAt: (tk as any).firstResponseAt ?? null,
          resolutionAt: (tk as any).resolutionAt ?? null,
        }),
      }
      return enriched
    })
  )
}

/** POST — raise a ticket. */
export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json()
    const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 120) : ""
    const category = ["GENERAL", "ACCOUNT", "TRANSACTION", "CARD", "TECHNICAL", "FRAUD"].includes(body.category) ? body.category : "GENERAL"
    if (!subject) return NextResponse.json({ error: "Subject required" }, { status: 400 })

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: p.userId,
        subject,
        category,
        priority: body.priority === "HIGH" ? "HIGH" : "MEDIUM",
        status: "OPEN",
        ...(typeof body.message === "string" && body.message.trim()
          ? { messages: { create: { senderId: p.userId, message: body.message.trim().slice(0, 1000) } } }
          : {}),
      },
      include: { messages: true },
    })
    return NextResponse.json(ticket)
  } catch {
    return NextResponse.json({ error: "Could not create ticket" }, { status: 500 })
  }
}

/**
 * PATCH — lifecycle + SLA stamps.
 * Admin: respond / resolve. User: add message while open.
 */
export async function PATCH(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json()
    const id = String(body.id || "")
    const ticket = await prisma.supportTicket.findUnique({ where: { id } })
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    const isAdmin = p.role === "ADMIN"
    if (!isAdmin && ticket.userId !== p.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const update: Record<string, unknown> = {}
    let responseSla: Record<string, unknown> | undefined

    if (isAdmin && body.action === "respond") {
      update.firstResponseAt = (ticket as any).firstResponseAt ?? new Date()
      update.status = "IN_PROGRESS"
      responseSla = slaFlags({ createdAt: ticket.createdAt, firstResponseAt: (update.firstResponseAt as Date) ?? null, resolutionAt: (ticket as any).resolutionAt ?? null })
    }
    if (isAdmin && body.action === "resolve") {
      update.firstResponseAt = (ticket as any).firstResponseAt ?? new Date()
      update.resolutionAt = new Date()
      update.status = "RESOLVED"
    }
    if (!isAdmin && body.action === "reopen") {
      update.status = "OPEN"
      update.resolutionAt = null
    }

    if (typeof body.reply === "string" && body.reply.trim()) {
      await prisma.ticketMessage.create({
        data: { ticketId: id, senderId: p.userId, message: body.reply.trim().slice(0, 1000) },
      })
    }
    if (Object.keys(update).length === 0 && !body.reply) {
      return NextResponse.json({ error: "Nothing to do" }, { status: 400 })
    }

    const updated = await prisma.supportTicket.update({ where: { id }, data: update })
    return NextResponse.json({
      ...updated,
      sla: responseSla ?? slaFlags({ createdAt: updated.createdAt, firstResponseAt: (updated as any).firstResponseAt ?? null, resolutionAt: (updated as any).resolutionAt ?? null }),
    })
  } catch (e) {
    console.error("ticket patch failed:", e)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}