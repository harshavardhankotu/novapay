"use client"
import { useState, useEffect } from "react"
import { Plus, PiggyBank, RefreshCw } from "lucide-react"

export default function PocketsPage() {
  const [pockets, setPockets] = useState<any[]>([])
  const [roundup, setRoundup] = useState<any>({ enabled: true, multiplier: 1, savedTotal: 0 })
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: "", target: "", category: "savings", color: "#2dd4bf" })

  useEffect(() => {
    fetch("/api/pockets").then(r => r.json()).then(d => { setPockets(d.pockets || []); setRoundup(d.roundup || { enabled: true, multiplier: 1, savedTotal: 0 }); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const createPocket = async () => {
    if (!form.name || !form.target) return
    const res = await fetch("/api/pockets", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, target: parseFloat(form.target), category: form.category, color: form.color }),
    })
    if (res.ok) { const p = await res.json(); setPockets(prev => [...prev, p]); setShowCreate(false); setForm({ name: "", target: "", category: "savings", color: "#2dd4bf" }) }
  }

  const toggleRoundup = async () => {
    const res = await fetch("/api/roundups", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !roundup.enabled }),
    })
    if (res.ok) { const r = await res.json(); setRoundup(r) }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Smart Pockets</h1><p className="text-[#8ea6b6] text-sm">Auto-save with roundups · Goal-based savings</p></div>
        <button onClick={() => setShowCreate(!showCreate)} className="bg-[#2dd4bf] hover:bg-[#14a390] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Pocket
        </button>
      </div>

      <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><RefreshCw className="w-5 h-5 text-[#2dd4bf]" /><div><p className="text-white font-medium">Round-ups</p><p className="text-[#8ea6b6] text-sm">Auto-save spare change</p></div></div>
          <div className="flex items-center gap-4">
            <span className="text-white font-semibold">₹{roundup.savedTotal?.toLocaleString("en-IN") || 0}</span>
            <button onClick={toggleRoundup} className={`relative w-12 h-6 rounded-full transition ${roundup.enabled ? "bg-[#2dd4bf]" : "bg-[#0e2633]"}`}>
              <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition ${roundup.enabled ? "left-6" : "left-0.5"}`} />
            </button>
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-3">
          <input placeholder="Pocket name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:outline-none focus:border-[#2dd4bf]" />
          <input type="number" placeholder="Target amount (₹)" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:outline-none focus:border-[#2dd4bf]" />
          <div className="flex gap-2">
            {["savings", "travel", "emergency", "education"].map(c => (
              <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${form.category === c ? "bg-[#2dd4bf] text-white" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{c}</button>
            ))}
          </div>
          <button onClick={createPocket} className="w-full bg-[#2dd4bf] hover:bg-[#14a390] text-white rounded-lg py-2.5 text-sm font-medium">Create Pocket</button>
        </div>
      )}

      {loading ? (
        <div className="text-[#8ea6b6] text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pockets.length === 0 && !showCreate && <div className="col-span-2 bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]"><PiggyBank className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" /><p className="text-[#8ea6b6]">No pockets created yet</p></div>}
          {pockets.map(p => {
            const pct = p.target > 0 ? Math.min(100, (p.current / p.target) * 100) : 0
            return (
              <div key={p.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{p.name}</span>
                  <span className="text-[#8ea6b6] text-sm">₹{p.current?.toLocaleString("en-IN") || 0} / ₹{p.target.toLocaleString("en-IN")}</span>
                </div>
                <div className="w-full bg-[#0e2633] h-2 rounded-full"><div className="bg-[#2dd4bf] h-2 rounded-full" style={{ width: `${pct}%` }} /></div>
                <p className="text-[#8ea6b6] text-xs mt-1">{pct.toFixed(0)}% complete</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
