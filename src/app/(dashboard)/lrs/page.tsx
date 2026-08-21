"use client"
import { useState, useEffect } from "react"
import { Globe, AlertTriangle } from "lucide-react"

export default function LRSPage() {
  const [txns, setTxns] = useState<any[]>([])
  const [limit, setLimit] = useState({ annualLimitUsd: 250000, usedLimitUsd: 0 })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ amountUsd: "", purpose: "Education", beneficiaryName: "" })
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/lrs").then(r => r.json()).then(d => {
      setTxns(d.transactions || [])
      setLimit({ annualLimitUsd: d.annualLimitUsd, usedLimitUsd: d.usedLimitUsd })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const submitLRS = async () => {
    setError("")
    const usd = parseFloat(form.amountUsd)
    if (!usd || usd <= 0) { setError("Enter a valid amount"); return }
    if (limit.usedLimitUsd + usd > limit.annualLimitUsd) { setError("Exceeds ₹7L (RBI remittance limit)"); return }
    const inr = usd * 87
    const tcs = usd > 7000 ? (usd * 0.05) * 87 : 0
    const res = await fetch("/api/lrs", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountUsd: usd, amountInr: inr, tcsAmount: tcs, purpose: form.purpose, beneficiaryName: form.beneficiaryName }),
    })
    if (res.ok) { const t = await res.json(); setTxns(prev => [t, ...prev]); setLimit(l => ({ ...l, usedLimitUsd: l.usedLimitUsd + usd })); setShowForm(false); setForm({ amountUsd: "", purpose: "Education", beneficiaryName: "" }) }
    else { const d = await res.json(); setError(d.error || "Failed") }
  }

  const pctUsed = (limit.usedLimitUsd / limit.annualLimitUsd) * 100

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">LRS Remittance</h1><p className="text-[#8ea6b6] text-sm">RBI Liberalised Remittance Scheme · ₹7L annual limit</p></div>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#2dd4bf] hover:bg-[#14a390] text-white px-4 py-2 rounded-lg text-sm font-medium">New Remittance</button>
      </div>

      <div className="bg-gradient-to-r from-blue-900/40 to-zinc-900 rounded-2xl p-6 border border-[#1e3d4d]">
        <div className="flex items-center gap-3 mb-3"><Globe className="w-6 h-6 text-blue-400" /><p className="text-white font-semibold">RBI LRS Limit</p></div>
        <p className="text-2xl font-bold text-white">${limit.annualLimitUsd.toLocaleString()} / yr</p>
        <p className="text-[#8ea6b6] text-sm mt-1">${limit.usedLimitUsd.toLocaleString()} used · ${(limit.annualLimitUsd - limit.usedLimitUsd).toLocaleString()} remaining</p>
        <div className="w-full bg-[#0e2633] h-2 rounded-full mt-3"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, pctUsed)}%` }} /></div>
      </div>

      {showForm && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-3">
          <div className="flex gap-2">
            {["Education", "Travel", "Medical", "Gift", "Investment"].map(p => (
              <button key={p} onClick={() => setForm(f => ({ ...f, purpose: p }))} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${form.purpose === p ? "bg-blue-500 text-white" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{p}</button>
            ))}
          </div>
          <input type="number" placeholder="Amount (USD)" value={form.amountUsd} onChange={e => setForm(f => ({ ...f, amountUsd: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:outline-none focus:border-blue-500" />
          <input placeholder="Beneficiary name" value={form.beneficiaryName} onChange={e => setForm(f => ({ ...f, beneficiaryName: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:outline-none focus:border-blue-500" />
          {form.amountUsd && <p className="text-[#8ea6b6] text-xs">≈ ₹{(parseFloat(form.amountUsd) * 87).toLocaleString("en-IN")} INR</p>}
          {error && <p className="text-red-400 text-xs flex items-center gap-1"><AlertTriangle className="w-4 h-4" />{error}</p>}
          <button onClick={submitLRS} className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium">Submit Remittance</button>
        </div>
      )}

      {loading ? (
        <div className="text-[#8ea6b6] text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-2">
          <h2 className="text-white font-semibold">Transaction History</h2>
          {txns.length === 0 ? (
            <p className="text-[#8ea6b6] text-sm py-4 text-center">No remittances yet</p>
          ) : (
            txns.map(t => (
              <div key={t.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] flex items-center justify-between">
                <div><p className="text-white font-medium">{t.beneficiaryName}</p><p className="text-[#8ea6b6] text-xs">{t.purpose} · {new Date(t.createdAt).toLocaleDateString()}</p></div>
                <div className="text-right"><p className="text-white font-semibold">${t.amountUsd}</p>{t.tcsAmount > 0 && <p className="text-yellow-400 text-xs">TCS: ₹{t.tcsAmount.toLocaleString("en-IN")}</p>}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
