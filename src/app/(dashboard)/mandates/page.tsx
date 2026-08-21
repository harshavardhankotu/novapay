"use client"
import { useState, useEffect } from "react"
import { Repeat, Plus, Pause, Play } from "lucide-react"

export default function MandatesPage() {
  const [mandates, setMandates] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: "", amount: "", frequency: "MONTHLY", accountId: "" })
  const [accounts, setAccounts] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/mandates").then(r => r.json()).then(d => { setMandates(d); setLoading(false) }).catch(() => setLoading(false))
    fetch("/api/accounts").then(r => r.json()).then(d => setAccounts(d.accounts || d || [])).catch(() => {})
  }, [])

  const create = async () => {
    if (!form.name || !form.amount || !form.accountId) return
    const res = await fetch("/api/mandates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }) })
    if (res.ok) { const m = await res.json(); setMandates(prev => [...prev, m]); setShowCreate(false); setForm({ name: "", amount: "", frequency: "MONTHLY", accountId: "" }) }
  }

  const toggle = async (id: string, status: string) => {
    const res = await fetch("/api/mandates", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: status === "ACTIVE" ? "PAUSED" : "ACTIVE" }) })
    if (res.ok) setMandates(prev => prev.map(m => m.id === id ? { ...m, status: m.status === "ACTIVE" ? "PAUSED" : "ACTIVE" } : m))
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Payment Mandates</h1><p className="text-[#8ea6b6] text-sm">eMandates · Recurring payments · Standing instructions</p></div>
        <button onClick={() => setShowCreate(!showCreate)} className="bg-[#2dd4bf] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> New Mandate</button>
      </div>
      {showCreate && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-3">
          <input placeholder="Mandate name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <input type="number" placeholder="Amount (₹)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <div className="flex gap-2">{["DAILY","WEEKLY","MONTHLY","YEARLY"].map(f => <button key={f} onClick={() => setForm(fm => ({ ...fm, frequency: f }))} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${form.frequency === f ? "bg-[#2dd4bf] text-white" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{f.toLowerCase()}</button>)}</div>
          <select value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]"><option value="">From account</option>{accounts.map((a: any) => <option key={a.id} value={a.id}>{a.accountNumber}</option>)}</select>
          <button onClick={create} className="w-full bg-[#2dd4bf] hover:bg-[#14a390] text-white rounded-lg py-2.5 text-sm font-medium">Create Mandate</button>
        </div>
      )}
      {loading ? <div className="text-center text-[#8ea6b6] py-8">Loading...</div> :
        mandates.length === 0 ? <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]"><Repeat className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" /><p className="text-[#8ea6b6]">No mandates</p></div> :
        mandates.map(m => (
          <div key={m.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] flex items-center justify-between">
            <div><p className="text-white font-medium">{m.name}</p><p className="text-[#8ea6b6] text-xs">₹{m.amount}/per {m.frequency.toLowerCase()} · Next: {new Date(m.nextRun).toLocaleDateString()}</p><p className="text-[#8ea6b6] text-xs">UMRN: {m.umrn} · {m.debitCount} debits</p></div>
            <div className="flex items-center gap-3"><span className={`text-xs px-2 py-0.5 rounded-full ${m.status === "ACTIVE" ? "bg-[#2dd4bf]/20 text-[#2dd4bf]" : "bg-yellow-900/50 text-yellow-400"}`}>{m.status}</span><button onClick={() => toggle(m.id, m.status)} className="p-1.5 rounded-lg bg-[#0e2633] hover:bg-[#0e2633]">{m.status === "ACTIVE" ? <Pause className="w-4 h-4 text-[#8ea6b6]" /> : <Play className="w-4 h-4 text-[#2dd4bf]" />}</button></div>
          </div>
        ))}
    </div>
  )
}
