"use client"
import { useState, useEffect } from "react"
import { Plus, PiggyBank, Lock, TrendingUp } from "lucide-react"

export default function FixedDepositsPage() {
  const [fds, setFds] = useState<any[]>([])
  const [loading, setLoading] = useState(true); const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ amount: "", months: "12", accountId: "", nominee: "", autoRenew: false })
  const [accounts, setAccounts] = useState<any[]>([])
  useEffect(() => {
    fetch("/api/fixed-deposits").then(r => r.json()).then(d => { setFds(d); setLoading(false) }).catch(() => setLoading(false))
    fetch("/api/accounts").then(r => r.json()).then(d => setAccounts(d.accounts || d || [])).catch(() => {})
  }, [])

  const create = async () => {
    if (!form.amount || !form.accountId) return
    const res = await fetch("/api/fixed-deposits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: parseFloat(form.amount), tenureMonths: parseInt(form.months), accountId: form.accountId, nominee: form.nominee, autoRenew: form.autoRenew }) })
    if (res.ok) { const fd = await res.json(); setFds(prev => [fd, ...prev]); setShowCreate(false); setForm({ amount: "", months: "12", accountId: "", nominee: "", autoRenew: false }) }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Fixed Deposits</h1><p className="text-[#8ea6b6] text-sm">7.5% p.a. · DICGC insured up to ₹5L</p></div>
        <button onClick={() => setShowCreate(!showCreate)} className="bg-[#2dd4bf] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> New FD</button>
      </div>
      {showCreate && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-3">
          <select value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]">
            <option value="">Select account</option>
            {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.accountNumber} (₹{a.balance})</option>)}
          </select>
          <input type="number" placeholder="Deposit amount (₹)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:outline-none focus:border-[#2dd4bf]" />
          <div className="flex gap-2">
            {["3","6","12","24","36","60"].map(m => <button key={m} onClick={() => setForm(f => ({ ...f, months: m }))} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${form.months === m ? "bg-[#2dd4bf] text-white" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{m}m</button>)}
          </div>
          <input placeholder="Nominee name" value={form.nominee} onChange={e => setForm(f => ({ ...f, nominee: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <label className="flex items-center gap-2 text-[#8ea6b6] text-sm"><input type="checkbox" checked={form.autoRenew} onChange={e => setForm(f => ({ ...f, autoRenew: e.target.checked }))} className="accent-[#2dd4bf]" /> Auto-renew on maturity</label>
          <button onClick={create} className="w-full bg-[#2dd4bf] hover:bg-[#14a390] text-white rounded-lg py-2.5 text-sm font-medium">Create FD</button>
        </div>
      )}
      {loading ? <div className="text-center text-[#8ea6b6] py-8">Loading...</div> :
        fds.length === 0 ? <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]"><PiggyBank className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" /><p className="text-[#8ea6b6]">No FDs yet</p></div> :
        fds.map(fd => (
          <div key={fd.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] flex items-center justify-between">
            <div><p className="text-white font-medium">₹{fd.amount.toLocaleString("en-IN")}</p><p className="text-[#8ea6b6] text-xs">{fd.tenureMonths}m @ {fd.interestRate}% · Matures {new Date(fd.maturityDate).toLocaleDateString()}</p></div>
            <div className="text-right"><p className="text-[#2dd4bf] font-semibold">₹{fd.maturityAmount?.toLocaleString("en-IN")}</p><span className="bg-[#2dd4bf]/20 text-[#2dd4bf] text-xs px-2 py-0.5 rounded-full">{fd.status}</span></div>
          </div>
        ))}
    </div>
  )
}
