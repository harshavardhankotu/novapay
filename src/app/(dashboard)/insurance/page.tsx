"use client"
import { useState, useEffect } from "react"
import { Shield, Plus, Calendar } from "lucide-react"

export default function InsurancePage() {
  const [policies, setPolicies] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [showBuy, setShowBuy] = useState(false)
  const [form, setForm] = useState({ type: "HEALTH", provider: "", sumAssured: "", premium: "", nominee: "" })

  useEffect(() => {
    fetch("/api/insurance").then(r => r.json()).then(d => { setPolicies(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const buy = async () => {
    if (!form.provider || !form.sumAssured) return
    const res = await fetch("/api/insurance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: form.type, provider: form.provider, sumAssured: parseFloat(form.sumAssured), premium: parseFloat(form.premium || "0"), nominee: form.nominee }) })
    if (res.ok) { const p = await res.json(); setPolicies(prev => [...prev, p]); setShowBuy(false); setForm({ type: "HEALTH", provider: "", sumAssured: "", premium: "", nominee: "" }) }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Insurance</h1><p className="text-[#8ea6b6] text-sm">Health · Life · Travel · Gadget cover</p></div>
        <button onClick={() => setShowBuy(!showBuy)} className="bg-[#2dd4bf] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> New Policy</button>
      </div>
      {showBuy && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-3">
          <div className="flex gap-2">{["HEALTH","LIFE","TRAVEL","GADGET"].map(t => <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${form.type === t ? "bg-[#2dd4bf] text-white" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{t}</button>)}</div>
          <input placeholder="Provider (e.g. HDFC Ergo)" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <div className="grid grid-cols-2 gap-3"><input type="number" placeholder="Sum assured (₹)" value={form.sumAssured} onChange={e => setForm(f => ({ ...f, sumAssured: e.target.value }))} className="bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" /><input type="number" placeholder="Premium (₹)" value={form.premium} onChange={e => setForm(f => ({ ...f, premium: e.target.value }))} className="bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" /></div>
          <input placeholder="Nominee" value={form.nominee} onChange={e => setForm(f => ({ ...f, nominee: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <button onClick={buy} className="w-full bg-[#2dd4bf] hover:bg-[#14a390] text-white rounded-lg py-2.5 text-sm font-medium">Buy Policy</button>
        </div>
      )}
      {loading ? <div className="text-center text-[#8ea6b6] py-8">Loading...</div> :
        policies.length === 0 ? <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]"><Shield className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" /><p className="text-[#8ea6b6]">No policies</p></div> :
        policies.map(p => (
          <div key={p.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d]">
            <div className="flex items-center justify-between mb-2"><span className="text-white font-medium capitalize">{p.type.toLowerCase()} · {p.provider}</span><span className="text-[#2dd4bf] text-xs bg-[#2dd4bf]/20 px-2 py-0.5 rounded-full">{p.status}</span></div>
            <p className="text-[#8ea6b6] text-xs">Policy: {p.policyNumber} · Sum: ₹{p.sumAssured.toLocaleString("en-IN")} · Premium: ₹{p.premium}/yr</p>
            <p className="text-[#8ea6b6] text-xs mt-1"><Calendar className="w-3 h-3 inline" /> {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</p>
          </div>
        ))}
    </div>
  )
}
