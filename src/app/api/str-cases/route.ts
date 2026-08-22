import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notify, audit } from "@/lib/banking"

const LEGAL: Record<string, string[]> = {
  OPEN: ["UNDER_REVIEW", "CLEARED", "ESCALATED"],
  UNDER_REVIEW: ["CLEARED", "ESCALATED"],
}

async function requireAdmin(request: Request) {
  const token = getTokenFromCookies(request)
  const payload = token ? verifyToken(token) : null
  if (!payload || payload.role !== "ADMIN") return null
  return payload
}

/** GET — admin case queue (or a user's own cases tied to their subject). */
export async function GET(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (p.role === "ADMIN") {
    const statusFilter = new URL(request.url).searchParams.get("status")
    const cases = await prisma.strCase.findMany({
      where: statusFilter ? { status: statusFilter } : { status: { in: ["OPEN", "UNDER_REVIEW"] } },
      orderBy: [{ status: "asc" }, { openedAt: "desc" }],
      include: { user: { select: { name: true, email: true } } },
    })
    return NextResponse.json(cases)
  }
  // Non-admin sees only their own (read-only)
  const own = await prisma.strCase.findMany({
    where: { subjectUserId: p.userId },
    orderBy: { openedAt: "desc" },
    select: { id: true, rule: true, summary: true, status: true, openedAt: true },
  })
  return NextResponse.json(own)
}

/**
 * POST /api/str-cases
 * Admin lifecycle: { caseId, action: "review"|"clear"|"escalate", note? }
 * Also allows admin to open a manual case: { open: {subjectUserId, rule, summary} }
 */
export async function POST(request: Request) {
  const admin = await requireAdmin(request)
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const body = await request.json()

    if (body.open) {
      const { subjectUserId, rule, summary, triggerRef } = body.open
      if (!subjectUserId || !rule || !summary) {
        return NextResponse.json({ error: "subjectUserId, rule and summary required" }, { status: 400 })
      }
      const created = await prisma.strCase.create({
        data: { subjectUserId, triggerRef: triggerRef || "manual", rule, summary, status: "OPEN" },
      })
      return NextResponse.json(created)
    }

    const caseId = String(body.caseId || "")
    const action = body.action as "review" | "clear" | "escalate"
    const note = typeof body.note === "string" ? body.note.trim() : ""

    const existing = await prisma.strCase.findUnique({ where: { id: caseId } })
    if (!existing) return NextResponse.json({ error: "Case not found" }, { status: 404 })

    const legal = LEGAL[existing.status] || []
    let nextStatus: string
    if (action === "review") {
      if (!legal.includes("UNDER_REVIEW")) return NextResponse.json({ error: `Cannot review from ${existing.status}` }, { status: 400 })
      nextStatus = "UNDER_REVIEW"
    } else if (action === "clear") {
      if (!legal.includes("CLEARED")) return NextResponse.json({ error: `Cannot clear from ${existing.status}` }, { status: 400 })
      nextStatus = "CLEARED"
    } else if (action === "escalate") {
      if (!legal.includes("ESCALATED")) return NextResponse.json({ error: `Cannot escalate from ${existing.status}` }, { status: 400 })
      if (!note) return NextResponse.json({ error: "Escalation requires a stated reason" }, { status: 400 })
      nextStatus = "ESCALATED"
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }

    const notes = JSON.parse(existing.notesJson || "[]") as { by: string; note: string; at: string }[]
    if (note) notes.push({ by: admin.name, note, at: new Date().toISOString() })

    const updated = await prisma.strCase.update({
      where: { id: caseId },
      data: {
        status: nextStatus,
        assignedTo: admin.name,
        notesJson: JSON.stringify(notes),
        closedAt: nextStatus === "CLEARED" || nextStatus === "ESCALATED" ? new Date() : null,
      },
    })

    await notify(
      existing.subjectUserId,
      nextStatus === "ESCALATED" ? "Account Under Escalated Review" : `Compliance Case ${nextStatus.replace("_", " ")}`,
      nextStatus === "CLEARED" ? "The compliance review on your account has been cleared. Thank you." : "Your compliance case has been updated."
    )
    await audit(existing.subjectUserId, `STR_${nextStatus}`, `Case ${existing.id}: ${existing.rule}`)

    return NextResponse.json(updated)
  } catch (e) {
    console.error("str-case action failed:", e)
    return NextResponse.json({ error: "Case action failed" }, { status: 500 })
  }
}