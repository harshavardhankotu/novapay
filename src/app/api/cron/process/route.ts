import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { processUserJobs, processAllUsersJobs } from "@/lib/jobs"

/**
 * Background-job processor ("bank's overnight batch").
 * POST /api/cron/process          → processes the calling user's due items
 * POST /api/cron/process  (admin) → processes every active user
 *
 * Designed to be called opportunistically from the dashboard and/or by an
 * external scheduler (Vercel Cron, GitHub Actions schedule, etc.).
 */
export async function POST(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  try {
    if (payload.role === "ADMIN") {
      const summary = await processAllUsersJobs()
      return NextResponse.json({ scope: "all-users", ...summary })
    }
    const summary = await processUserJobs(payload.userId)
    return NextResponse.json({ scope: "user", ...summary })
  } catch {
    return NextResponse.json({ error: "Job processing failed" }, { status: 500 })
  }
}