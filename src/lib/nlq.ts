import { prisma } from "@/lib/prisma"

/**
 * ── NL ledger query (P11) ────────────────────────────────────────────────────
 * The LLM NEVER writes SQL. It may only SELECT one of these registered query
 * shapes and fill its parameters; a server-side validator enforces the
 * whitelist before anything executes. Without an API key, a deterministic
 * keyword parser does the selection. Every query is audit-logged.
 */

export const SHAPE_NAMES = ["SPEND_BY_CATEGORY", "TOP_MERCHANTS", "RECURRING_EXPENSES", "INCOME_VS_EXPENSE"] as const
export type ShapeName = (typeof SHAPE_NAMES)[number]

interface ShapeDef {
  description: string
  defaultDays: number
  /** Executes with a session-scoped userId — cross-user access is impossible by construction. */
  execute: (userId: string, days: number) => Promise<unknown>
}

const round2 = (x: number) => Math.round(x * 100) / 100

export const SHAPES: Record<ShapeName, ShapeDef> = {
  SPEND_BY_CATEGORY: {
    description: "Total spend per category over N days",
    defaultDays: 30,
    async execute(userId, days) {
      const since = new Date(Date.now() - days * 86400000)
      const txns = await prisma.transaction.findMany({
        where: { account: { userId }, type: "DEBIT", status: "COMPLETED", timestamp: { gte: since } },
        select: { amount: true, category: true },
      })
      const map = new Map<string, number>()
      for (const t of txns) {
        const cat = t.category ?? "Other"
        map.set(cat, round2((map.get(cat) ?? 0) + Math.abs(t.amount)))
      }
      return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([category, total]) => ({ category, total }))
    },
  },
  TOP_MERCHANTS: {
    description: "Top N merchants by spend over N days",
    defaultDays: 30,
    async execute(userId, days) {
      const since = new Date(Date.now() - days * 86400000)
      const txns = await prisma.transaction.findMany({
        where: { account: { userId }, type: "DEBIT", status: "COMPLETED", timestamp: { gte: since } },
        select: { amount: true, counterparty: true },
      })
      const map = new Map<string, number>()
      for (const t of txns) {
        const key = (t.counterparty || "Unknown").slice(0, 40)
        map.set(key, round2((map.get(key) ?? 0) + Math.abs(t.amount)))
      }
      return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([merchant, total]) => ({ merchant, total }))
    },
  },
  RECURRING_EXPENSES: {
    description: "Recurring expense subscriptions/mandates",
    defaultDays: 90,
    async execute(userId, _days) {
      void _days
      const mandates = await prisma.paymentMandate.findMany({
        where: { userId },
        select: { name: true, amount: true, frequency: true, status: true },
      })
      return mandates.map((m) => ({ name: m.name, amount: m.amount, frequency: m.frequency, status: m.status }))
    },
  },
  INCOME_VS_EXPENSE: {
    description: "Income vs expense totals per month for the last N months",
    defaultDays: 90,
    async execute(userId, days) {
      const since = new Date(Date.now() - days * 86400000)
      const txns = await prisma.transaction.findMany({
        where: { account: { userId }, status: "COMPLETED", timestamp: { gte: since } },
        select: { type: true, amount: true, timestamp: true },
      })
      const buckets = new Map<string, { income: number; expense: number }>()
      for (const t of txns) {
        const key = new Date(t.timestamp).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
        if (!buckets.has(key)) buckets.set(key, { income: 0, expense: 0 })
        const b = buckets.get(key)!
        if (t.type === "CREDIT") b.income = round2(b.income + t.amount)
        else b.expense = round2(b.expense + Math.abs(t.amount))
      }
      return [...buckets.entries()].map(([month, v]) => ({ month, ...v }))
    },
  },
}

// ── Deterministic keyword parser ─────────────────────────────────────────────

export function parseIntentDeterministic(query: string): { shape: ShapeName; params: { days: number } } | null {
  const q = query.toLowerCase()

  // Days extraction ("last 7 days", "past 30 days")
  let days = 0
  const dayMatch = q.match(/(\d{1,3})\s*(?:day|week|month)/)
  if (dayMatch) {
    const n = parseInt(dayMatch[1], 10)
    days = /week/.test(dayMatch[0]) ? n * 7 : /month/.test(dayMatch[0]) ? n * 30 : n
  }

  const hasAny = (...words: string[]) => words.some((w) => q.includes(w))

  if (hasAny("top merchant", "merchants", "who do i pay")) {
    return { shape: "TOP_MERCHANTS", params: { days: days || 30 } }
  }
  if (hasAny("recurring", "subscription", "mandate", "netflix")) {
    return { shape: "RECURRING_EXPENSES", params: { days: 90 } }
  }
  if (hasAny("income vs", "income and expense", "earn vs", "trend")) {
    return { shape: "INCOME_VS_EXPENSE", params: { days: days || 90 } }
  }
  if (hasAny("spend by category", "categories", "spend on", "how much did i spend", "spent on")) {
    return { shape: "SPEND_BY_CATEGORY", params: { days: days || 30 } }
  }
  // Generic bare-spend phrasing ("where did my money go", "spend last 2 weeks")
  if (hasAny("spend", "spent")) {
    return { shape: "SPEND_BY_CATEGORY", params: { days: days || 30 } }
  }
  return null
}

/** Whitelist validator for ANY intent source. */
export function validateIntent(candidate: unknown): { shape: ShapeName; params: { days: number } } | null {
  if (!candidate || typeof candidate !== "object") return null
  const c = candidate as any
  if (!SHAPE_NAMES.includes(c.shape)) return null
  let days = Number(c.params?.days)
  if (!Number.isFinite(days)) days = SHAPES[c.shape as ShapeName].defaultDays
  days = Math.max(7, Math.min(365, Math.floor(days))) // hard bounds
  return { shape: c.shape as ShapeName, params: { days } }
}

/** LLM intent-selector (only when keys configured). Returns validated intent or null. */
async function extractIntentViaLLM(query: string): Promise<{ shape: ShapeName; params: { days: number } } | null> {
  const openaiKey = process.env.OPENAI_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY
  if (!openaiKey && !geminiKey) return null

  const prompt =
    `Classify this question into exactly one JSON object {"shape": "...", "params": {"days": number}} ` +
    `where shape is one of [${SHAPE_NAMES.join(", ")}]. JSON only.\n\nQUESTION: ${query.slice(0, 300)}`

  try {
    let raw = ""
    if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" }, max_tokens: 80 }),
        signal: AbortSignal.timeout(12000),
      })
      raw = (await res.json()).choices?.[0]?.message?.content ?? ""
    } else {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }), signal: AbortSignal.timeout(12000) }
      )
      raw = (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text ?? ""
    }
    return validateIntent(JSON.parse(raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim()))
  } catch {
    return null
  }
}

export interface NlQueryResult {
  shape: ShapeName
  params: { days: number }
  data: unknown
  viaLlm: boolean
}

/** Full pipeline: intent → whitelist validation → scoped execution → audit log. */
export async function runNlQuery(userId: string, query: string): Promise<NlQueryResult | { error: string; hint: string }> {
  if (!query.trim() || query.length > 300) {
    return { error: "Ask a question up to 300 characters.", hint: "" }
  }

  let intent = await extractIntentViaLLM(query)
  const viaLlm = !!intent
  if (!intent) intent = parseIntentDeterministic(query)

  if (!intent) {
    await prisma.nlQueryLog.create({ data: { userId, query: query.slice(0, 300), shape: "UNMATCHED", paramsJson: "{}" } }).catch(() => {})
    return {
      error: "I couldn't map that to a supported report.",
      hint: "Try: 'spend by category last 60 days', 'top merchants', 'my recurring expenses', or 'income vs expense trend'.",
    }
  }

  const data = await SHAPES[intent.shape].execute(userId, intent.params.days)
  await prisma.nlQueryLog
    .create({ data: { userId, query: query.slice(0, 300), shape: intent.shape, paramsJson: JSON.stringify(intent.params) } })
    .catch(() => {})

  void viaLlm
  return { shape: intent.shape, params: intent.params, data, viaLlm }
}