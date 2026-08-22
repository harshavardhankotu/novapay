import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { gatherHealthInputs, computeHealthScore, upsertWeeklySnapshot } from "@/lib/scoring"

export async function GET(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  try {
    const inputs = await gatherHealthInputs(payload.userId)
    const result = computeHealthScore(inputs)

    // Persist weekly trend point (no-op if a fresh one exists)
    await upsertWeeklySnapshot(payload.userId).catch(() => null)

    const history = await prisma.scoreSnapshot.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "asc" },
      take: 12,
      select: { total: true, createdAt: true },
    })

    return NextResponse.json({
      total: result.total,
      factors: result.factors,
      inputs,
      history: history.map((h) => ({ date: h.createdAt, total: h.total })),
    })
  } catch {
    return NextResponse.json({ error: "Failed to compute score" }, { status: 500 })
  }
}