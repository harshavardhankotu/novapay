"use client"
import { useState, useEffect } from "react"
import { FileText, Download, Sparkles } from "lucide-react"

export default function StatementsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [period, setPeriod] = useState("monthly")
  const [insight, setInsight] = useState("")
  const [loading, setLoading] = useState(true)

  const analyzeSpending = (txns: any[]) => {
    const catMap: Record<string, number> = {}
    txns.forEach(t => { catMap[t.category || "other"] = (catMap[t.category || "other"] || 0) + Math.abs(t.amount) })
    const entries = Object.entries(catMap).sort((a: any, b: any) => b[1] - a[1])
    if (entries.length === 0) { setInsight("No transaction data yet. Start spending to get insights."); return }
    const top = entries[0]
    const total = entries.reduce((s: number, e: any) => s + e[1], 0)
    setInsight(`Top category: ${top[0]} (${((top[1] as number) / total * 100).toFixed(1)}% of spend). ${entries.length > 1 ? `Potential savings in ${entries[entries.length - 1][0]}: ${((entries[entries.length - 1][1] as number) / total * 100).toFixed(1)}%` : ""}`)
  }

  useEffect(() => {
    fetch("/api/transactions").then(r => r.json()).then(d => {
      const txns = d.transactions || []
      setTransactions(txns)
      setLoading(false)
      analyzeSpending(txns)
    }).catch(() => setLoading(false))
  }, [])

  const grouped = transactions.reduce((acc: any, t: any) => {
    const date = new Date(t.createdAt || t.date || t.timestamp)
    const key = period === "monthly" ? date.toLocaleString("default", { month: "long", year: "numeric" }) : date.toLocaleString("default", { month: "long", day: "numeric", year: "numeric" })
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {} as Record<string, any[]>)

  const totalSpend = transactions.reduce((s: number, t: any) => s + (t.amount < 0 ? Math.abs(t.amount) : 0), 0)
  const totalIncome = transactions.reduce((s: number, t: any) => s + (t.amount > 0 ? t.amount : 0), 0)

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Smart Statements</h1><p className="text-[#8ea6b6] text-sm">AI-powered spending analysis · RBI-compliant statements</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d]"><p className="text-[#8ea6b6] text-xs">Total Income</p><p className="text-white text-xl font-bold">₹{totalIncome.toLocaleString("en-IN")}</p></div>
        <div className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d]"><p className="text-[#8ea6b6] text-xs">Total Spend</p><p className="text-white text-xl font-bold">₹{totalSpend.toLocaleString("en-IN")}</p></div>
        <div className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d]"><p className="text-[#8ea6b6] text-xs">Savings Rate</p><p className="text-white text-xl font-bold">{totalIncome > 0 ? `${(((totalIncome - totalSpend) / totalIncome) * 100).toFixed(1)}%` : "—"}</p></div>
      </div>

      {insight && (
        <div className="bg-gradient-to-r from-purple-900/30 to-zinc-900 rounded-2xl p-4 border border-[#1e3d4d] flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
          <p className="text-[#f3efe6] text-sm">{insight}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["monthly", "daily"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${period === p ? "bg-[#2dd4bf] text-white" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{p}</button>
          ))}
        </div>
        <a
          href="/api/statements/pdf?months=3"
          className="text-[#8ea6b6] hover:text-white text-sm flex items-center gap-1"
          title="Download PDF statement with running balance (last 3 months)"
        >
          <Download className="w-4 h-4" /> PDF Statement
        </a>
      </div>

      {loading ? (
        <div className="text-[#8ea6b6] text-center py-8">Loading...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]">
          <FileText className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" />
          <p className="text-[#8ea6b6]">No transactions for this period</p>
        </div>
      ) : (
        Object.entries(grouped).map(([periodKey, txns]) => (
          <div key={periodKey}>
            <h3 className="text-[#8ea6b6] text-sm font-medium mb-2">{periodKey}</h3>
            <div className="space-y-1">
              {(txns as any[]).map((t: any, i: number) => (
                <div key={t.id || i} className="bg-[#0e2633] rounded-xl px-4 py-3 border border-[#1e3d4d] flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm truncate">{t.description || t.merchant || t.category || "Transaction"}</p>
                    <p className="text-[#8ea6b6] text-xs">{new Date(t.createdAt || t.date || t.timestamp).toLocaleDateString()}</p>
                  </div>
                  <p className={`text-sm font-semibold ml-4 ${t.amount > 0 ? "text-[#2dd4bf]" : "text-white"}`}>{t.amount > 0 ? "+" : ""}₹{Math.abs(t.amount).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
