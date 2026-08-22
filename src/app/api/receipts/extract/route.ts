import { NextResponse } from "next/server"
import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { extractReceipt, ExtractionError } from "@/lib/ocr"

/**
 * POST /api/receipts/extract  { text }
 * Constrained extraction ONLY — returns a suggestion the user must confirm.
 * Never touches the ledger. LLM path when a key is configured; deterministic
 * labelled fallback otherwise.
 */
export async function POST(request: Request) {
  const t = getTokenFromCookies(request); const p = verifyToken(t || "")
  if (!p) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const text = typeof body.text === "string" ? body.text.slice(0, 4000) : ""
    if (!text.trim()) {
      return NextResponse.json({ error: "Paste or upload receipt text first" }, { status: 400 })
    }

    const { extraction, warnings } = await extractReceipt(text)
    return NextResponse.json({
      extraction,
      warnings,
      requiresConfirmation: true, // hard contract with the client
    })
  } catch (e) {
    if (e instanceof ExtractionError) {
      return NextResponse.json(
        { error: e.message, code: e.code },
        { status: e.code === "EMPTY_INPUT" ? 400 : 422 }
      )
    }
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 })
  }
}