import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { runNlQuery } from "@/lib/nlq"

export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { query } = await request.json()
    if (typeof query !== "string") return NextResponse.json({ error: "query required" }, { status: 400 })
    const result = await runNlQuery(p.userId, query)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Query failed" }, { status: 500 })
  }
}