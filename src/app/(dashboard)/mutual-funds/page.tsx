"use client"
import { useState, useEffect } from "react"
import { TrendingUp, Plus, BarChart3 } from "lucide-react"

export default function MutualFundsPage() {
  const [funds, setFunds] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [showBuy, setShowBuy] = useState(false)
  const [form, setForm] = useState({ fundName: "", fundCategory: "Large Cap", amount: "", nav: "100" })

  useEffect(() => {
    fetch("/api/mutual-funds").then(r => r.json()).then(d => { setFunds(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const buy = async () => {
    if (!form.fundName || !form.amount) return
    const res = await fetch("/api/mutual-funds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fundName: form.fundName, fundCategory: form.fundCategory, lumpsumAmount: parseFloat(form.amount), nav: parseFloat(form.nav) }) })
    if (res.ok) { const f = await res.json(); setFunds(prev => [...prev, f]); setShowBuy(false); setForm({ fundName: "", fundCategory: "Large Cap", amount: "", nav: "100" }) }
  }

  const totalInvested = funds.reduce((s, f) => s + f.investedAmount, 0)
  const totalCurrent = funds.reduce((s, f) => s + f.currentValue, 0)
  const returns = totalCurrent - totalInvested

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Mutual Funds</h1><p className="text-[#8ea6b6] text-sm">SIP & Lumpsum · 5000+ funds</p></div>
        <button onClick={() => setShowBuy(!showBuy)} className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Invest</button>
      </div>
      <div className="bg-gradient-to-r from-purple-900/40 to-zinc-900 rounded-2xl p-6 border border-[#1e3d4d]">
        <p className="text-[#8ea6b6] text-sm">Portfolio Value</p>
        <p className="text-3xl font-bold text-white">₹{totalCurrent.toLocaleString("en-IN")}</p>
        <p className={`${returns >= 0 ? "text-[#2dd4bf]" : "text-red-400"} text-sm`}>{returns >= 0 ? "+" : ""}₹{returns.toLocaleString("en-IN")} overall</p>
      </div>
      {showBuy && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-3">
          <input placeholder="Fund name" value={form.fundName} onChange={e => setForm(f => ({ ...f, fundName: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <div className="flex gap-2">{["Large Cap","Mid Cap","Small Cap","ELSS","Index","Hybrid"].map(c => <button key={c} onClick={() => setForm(f => ({ ...f, fundCategory: c }))} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${form.fundCategory === c ? "bg-purple-500 text-white" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{c}</button>)}</div>
          <input type="number" placeholder="Amount (₹)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <button onClick={buy} className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-lg py-2.5 text-sm font-medium">Invest Now</button>
        </div>
      )}
      {loading ? <div className="text-center text-[#8ea6b6] py-8">Loading...</div> :
        funds.length === 0 ? <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]"><BarChart3 className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" /><p className="text-[#8ea6b6]">No investments yet</p></div> :
        funds.map(f => {
          const ret = f.currentValue - f.investedAmount
          return <div key={f.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] flex items-center justify-between">
            <div><p className="text-white font-medium">{f.fundName}</p><p className="text-[#8ea6b6] text-xs">{f.fundCategory} · {f.units.toFixed(3)} units</p></div>
            <div className="text-right"><p className="text-white font-semibold">₹{f.currentValue.toLocaleString("en-IN")}</p><p className={`text-xs ${ret >= 0 ? "text-[#2dd4bf]" : "text-red-400"}`}>{ret >= 0 ? "+" : ""}₹{ret.toLocaleString("en-IN")}</p></div>
          </div>
        })}
    </div>
  )
}
