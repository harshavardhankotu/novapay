"use client"
import { useState, useEffect } from "react"
import { Plus, Landmark, Calendar, IndianRupee } from "lucide-react"

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [showApply, setShowApply] = useState(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [form, setForm] = useState({ type: "PERSONAL", principal: "", months: "24", accountId: "" })
  useEffect(() => {
    fetch("/api/loans").then(r => r.json()).then(d => { setLoans(d); setLoading(false) }).catch(() => setLoading(false))
    fetch("/api/accounts").then(r => r.json()).then(d => setAccounts(d.accounts || d || [])).catch(() => {})
  }, [])

  const apply = async () => {
    if (!form.principal || !form.accountId) return
    const res = await fetch("/api/loans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: form.type, principal: parseFloat(form.principal), tenureMonths: parseInt(form.months), accountId: form.accountId }) })
    if (res.ok) { const l = await res.json(); setLoans(prev => [l, ...prev]); setShowApply(false); setForm({ type: "PERSONAL", principal: "", months: "24", accountId: "" }) }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Loans</h1><p className="text-[#8ea6b6] text-sm">Personal · Home · Auto · Education · Business</p></div>
        <button onClick={() => setShowApply(!showApply)} className="bg-[#2dd4bf] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Apply</button>
      </div>
      {showApply && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-3">
          <div className="flex gap-2 flex-wrap">
            {[{k:"PERSONAL",v:"Personal"},{k:"HOME",v:"Home"},{k:"AUTO",v:"Auto"},{k:"EDUCATION",v:"Education"},{k:"BUSINESS",v:"Business"}].map(t =>
              <button key={t.k} onClick={() => setForm(f => ({ ...f, type: t.k }))} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${form.type === t.k ? "bg-[#2dd4bf] text-white" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{t.v}</button>
            )}
          </div>
          <select value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]"><option value="">Select disbursal account</option>{accounts.map((a: any) => <option key={a.id} value={a.id}>{a.accountNumber}</option>)}</select>
          <input type="number" placeholder="Principal (₹)" value={form.principal} onChange={e => setForm(f => ({ ...f, principal: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <div className="flex gap-2">{["12","24","36","48","60","120","240"].map(m => <button key={m} onClick={() => setForm(f => ({ ...f, months: m }))} className={`px-2 py-1 rounded-lg text-xs font-medium ${form.months === m ? "bg-[#2dd4bf] text-white" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{m}m</button>)}</div>
          <button onClick={apply} className="w-full bg-[#2dd4bf] hover:bg-[#14a390] text-white rounded-lg py-2.5 text-sm font-medium">Check Eligibility & Apply</button>
        </div>
      )}
      {loading ? <div className="text-center text-[#8ea6b6] py-8">Loading...</div> :
        loans.length === 0 ? <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]"><Landmark className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" /><p className="text-[#8ea6b6]">No loans</p></div> :
        loans.map(l => (
          <div key={l.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d]">
            <div className="flex items-center justify-between mb-2"><span className="text-white font-medium capitalize">{l.type.toLowerCase()} Loan</span><span className={`text-xs px-2 py-0.5 rounded-full ${l.status === "ACTIVE" ? "bg-[#2dd4bf]/20 text-[#2dd4bf]" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{l.status}</span></div>
            <div className="grid grid-cols-3 gap-4 text-sm"><div><span className="text-[#8ea6b6]">Principal</span><p className="text-white">₹{l.principal.toLocaleString("en-IN")}</p></div><div><span className="text-[#8ea6b6]">EMI</span><p className="text-white">₹{l.emiAmount?.toLocaleString("en-IN")}</p></div><div><span className="text-[#8ea6b6]">Outstanding</span><p className="text-white">₹{l.outstanding?.toLocaleString("en-IN")}</p></div></div>
            <p className="text-[#8ea6b6] text-xs mt-2">{l.interestRate}% p.a. · {l.tenureMonths} months · Due: {l.dueDate ? new Date(l.dueDate).toLocaleDateString() : "—"}</p>
          </div>
        ))}
    </div>
  )
}
