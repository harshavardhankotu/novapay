/**
 * ── Receipt extraction (P9) ──────────────────────────────────────────────────
 * Constrained AI extraction per the global guardrails:
 *  • If OPENAI_API_KEY / GEMINI_API_KEY is configured, a real LLM is called
 *    with a STRICT JSON-schema prompt. Its output is validated server-side
 *    against the whitelist before being returned — malformed output falls
 *    back to the deterministic engine.
 *  • Without keys, a labelled heuristic parser runs instead.
 * NOTHING here posts to the ledger — the user must confirm every field.
 */

export const EXTRACTABLE_CATEGORIES = [
  "Food & Dining", "Groceries", "Shopping", "Transportation",
  "Bills & Utilities", "Healthcare", "Entertainment", "Other",
] as const
export type ExtractableCategory = (typeof EXTRACTABLE_CATEGORIES)[number]

export interface Extraction {
  merchant: string
  amount: number
  category: string // guaranteed member of the whitelist
  date: string | null
  confidence: number // 0..1
  source: "llm" | "heuristic"
}

export class ExtractionError extends Error {
  constructor(public code: "EMPTY_INPUT" | "NO_AMOUNT_FOUND" | "LLM_UNAVAILABLE", message: string) {
    super(message)
  }
}

const KEYWORD_CATEGORY_MAP: [RegExp, ExtractableCategory][] = [
  [/swiggy|zomato|restaurant|cafe|pizza|kfc|mcdonald/i, "Food & Dining"],
  [/bigbasket|grocery|kirana|dmart|supermarket/i, "Groceries"],
  [/amazon|flipkart|myntra|ajio|shopping|mall/i, "Shopping"],
  [/uber|ola|metro|petrol|fuel|irctc|rapido/i, "Transportation"],
  [/electricity|water bill|gas bill|broadband|wifi|airtel|jio fiber/i, "Bills & Utilities"],
  [/pharmacy|apollo|hospital|clinic|medical/i, "Healthcare"],
  [/netflix|bookmyshow|cinema|pvr|spotify|game/i, "Entertainment"],
]

function guessCategory(text: string): ExtractableCategory {
  for (const [re, cat] of KEYWORD_CATEGORY_MAP) {
    if (re.test(text)) return cat
  }
  return "Other"
}

/** Deterministic fallback parser — always available, zero dependencies. */
export function extractWithHeuristics(rawText: string): Extraction {
  const text = rawText.trim()
  if (!text) throw new ExtractionError("EMPTY_INPUT", "Receipt text was empty")

  // Amount: prefer an explicit total line; otherwise the largest ₹ number found.
  let amount = 0
  const totalMatch = text.match(/(?:grand\s*total|total|amount(?:\s*due)?|paid)\s*[:\-–]?\s*[₹rs.]*\s*([\d,]+(?:\.\d{1,2})?)/i)
  if (totalMatch) {
    amount = parseFloat(totalMatch[1].replace(/,/g, ""))
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    const allNums = [...text.matchAll(/[₹]\s*([\d,]+(?:\.\d{1,2})?)/g)].map((m) => parseFloat(m[1].replace(/,/g, "")))
    if (allNums.length > 0) amount = Math.max(...allNums)
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ExtractionError("NO_AMOUNT_FOUND", "Couldn't find a credible amount in this receipt.")
  }
  amount = Math.round(amount * 100) / 100

  // Merchant: first meaningful short line that isn't a number
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean)
  const merchantLine =
    lines.find((l) => l.length >= 3 && l.length <= 40 && !/^[\d₹\s.,-]+$/.test(l) && !/^(tax|gst|invoice|receipt|date)/i.test(l)) ||
    lines[0] ||
    "Unknown merchant"

  const dateMatch = text.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/)
  const date = dateMatch ? new Date(dateMatch[0]).toISOString() : null

  const keywordHit = KEYWORD_CATEGORY_MAP.some(([re]) => re.test(text))

  return {
    merchant: merchantLine.slice(0, 60),
    amount,
    category: guessCategory(text),
    date,
    confidence: keywordHit ? 0.55 : 0.35,
    source: "heuristic",
  }
}

/** Whitelist validation applied to ANY extractor's output. */
function validateCandidate(c: any, source: Extraction["source"]): Extraction | null {
  const merchant = typeof c?.merchant === "string" ? c.merchant.trim().slice(0, 60) : ""
  const amount = Math.round(Number(c?.amount) * 100) / 100
  const category = typeof c?.category === "string" ? c.category.trim() : ""
  if (!merchant || !Number.isFinite(amount) || amount <= 0) return null
  if (!(EXTRACTABLE_CATEGORIES as readonly string[]).includes(category)) return null
  const confidence = Math.max(0, Math.min(1, Number(c.confidence) || 0.7))
  return {
    merchant,
    amount,
    category,
    date: typeof c.date === "string" && !isNaN(Date.parse(c.date)) ? c.date : null,
    confidence,
    source,
  }
}

/** Optional LLM pass (only when a key exists). Strict schema, hard timeout. */
async function extractWithLLM(rawText: string): Promise<Extraction | null> {
  const openaiKey = process.env.OPENAI_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY
  const prompt =
    `Extract from this receipt exactly one JSON object with keys ` +
    `merchant(string), amount(number), category(one of: ${EXTRACTABLE_CATEGORIES.join(" | ")}), ` +
    `date(ISO or null), confidence(0-1). JSON only, no prose.\n\nRECEIPT:\n${rawText.slice(0, 2000)}`

  try {
    let rawJson = ""
    if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          max_tokens: 200,
        }),
        signal: AbortSignal.timeout(15000),
      })
      const j = await res.json()
      rawJson = j.choices?.[0]?.message?.content ?? ""
    } else if (geminiKey) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          signal: AbortSignal.timeout(15000),
        }
      )
      const j = await res.json()
      rawJson = j.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
    } else {
      return null // no keys — caller uses heuristics and labels them
    }

    const cleaned = rawJson.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim()
    return validateCandidate(JSON.parse(cleaned), "llm")
  } catch {
    return null
  }
}

/** Public entry point: best-effort LLM first, validated; then heuristics. */
export async function extractReceipt(rawText: string): Promise<{ extraction: Extraction; warnings: string[] }> {
  const warnings: string[] = []
  const hasKeys = !!(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY)

  if (hasKeys) {
    const llm = await extractWithLLM(rawText)
    if (llm) return { extraction: llm, warnings }
    warnings.push("AI extraction unavailable or invalid — used the built-in rule-based parser instead.")
  } else {
    warnings.push("Simulated OCR: no AI key configured, so the rule-based parser was used. Paste clear receipt text for best results.")
  }

  const heuristic = extractWithHeuristics(rawText)
  if (heuristic.confidence < 0.5) {
    warnings.push(`Low confidence (${Math.round(heuristic.confidence * 100)}%) — please review every field before recording.`)
  }
  return { extraction: heuristic, warnings }
}