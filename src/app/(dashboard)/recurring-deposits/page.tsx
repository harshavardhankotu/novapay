"use client"
import { useState, useEffect } from "react"
import { Plus, Repeat, Calendar } from "lucide-react"

export default function RDPage() {
  const [rds, setRds] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ monthlyAmount: "", months: "24", accountId: "", nominee: "" })
  const [accounts, setAccounts] = useState<any[]>([])
  useEffect(() => {
    fetch("/api/recurring-deposits").then(r => r.json()).then(d => { setRds(d); setLoading(false) }).catch(() => setLoading(false))
    fetch("/api/accounts").then(r => r.json()).then(d => setAccounts(d.accounts || d || [])).catch(() => {})
  }, [])

  const create = async () => {
    if (!form.monthlyAmount || !form.accountId) return
    const res = await fetch("/api/recurring-deposits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ monthlyAmount: parseFloat(form.monthlyAmount), tenureMonths: parseInt(form.months), accountId: form.accountId, nominee: form.nominee }) })
    if (res.ok) { const rd = await res.json(); setRds(prev => [rd, ...prev]); setShowCreate(false); setForm({ monthlyAmount: "", months: "24", accountId: "", nominee: "" }) }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Recurring Deposits</h1><p className="text-[#8ea6b6] text-sm">8% p.a. · Build savings habit</p></div>
        <button onClick={() => setShowCreate(!showCreate)} className="bg-[#2dd4bf] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> New RD</button>
      </div>
      {showCreate && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-3">
          <select value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]">
            <option value="">Select account</option>
            {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.accountNumber}</option>)}
          </select>
          <input type="number" placeholder="Monthly deposit (₹)" value={form.monthlyAmount} onChange={e => setForm(f => ({ ...f, monthlyAmount: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <div className="flex gap-2">{["6","12","24","36","60"].map(m => <button key={m} onClick={() => setForm(f => ({ ...f, months: m }))} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${form.months === m ? "bg-[#2dd4bf] text-white" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{m}m</button>)}</div>
          <input placeholder="Nominee" value={form.nominee} onChange={e => setForm(f => ({ ...f, nominee: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <button onClick={create} className="w-full bg-[#2dd4bf] hover:bg-[#14a390] text-white rounded-lg py-2.5 text-sm font-medium">Create RD</button>
        </div>
      )}
      {loading ? <div className="text-center text-[#8ea6b6] py-8">Loading...</div> :
        rds.length === 0 ? <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]"><Repeat className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" /><p className="text-[#8ea6b6]">No RDs yet</p></div> :
        rds.map(rd => (
          <div key={rd.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] flex items-center justify-between">
            <div><p className="text-white font-medium">₹{rd.monthlyAmount}/mo</p><p className="text-[#8ea6b6] text-xs">{rd.tenureMonths}m @ {rd.interestRate}% · Deposited: ₹{rd.totalDeposited}</p></div>
            <div className="text-right"><Calendar className="w-4 h-4 inline text-[#8ea6b6]" /><span className="text-[#8ea6b6] text-xs ml-1">{new Date(rd.maturityDate).toLocaleDateString()}</span><span className="block text-[#2dd4bf] text-xs">{rd.status}</span></div>
          </div>
        ))}
    </div>
  )
}
