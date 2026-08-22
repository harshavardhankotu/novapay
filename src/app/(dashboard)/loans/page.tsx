"use client"
import { useCallback, useEffect, useState } from "react"
import { Plus, Landmark, Calendar, Loader2, CheckCircle2, AlertCircle, ChevronDown, Wallet } from "lucide-react"

interface Loan {
  id: string; type: string; principal: number; interestRate: number
  tenureMonths: number; emiAmount: number; outstanding: number
  totalPaid: number; status: string; collectionsStatus?: string
  penaltyAccrued?: number; dueDate?: string
}
interface Application {
  id: string; amount: number; tenureMonths: number; status: string
  decisionReason?: string | null; approvedAmount?: number | null; createdAt: string
}
interface Installment { no: number; dueDate: string; openingBalance: number; principal: number; interest: number; total: number; paidAt?: string | null }
interface ScheduleData { loan: Loan & { collectionsStatus: string }; installments: Installment[]; paidCount: number }
interface Overdraft { facility: { limit: number; utilized: number; accruedInterest: number; interestRate: number; status: string } | null; available?: number; totalDue?: number }

const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [od, setOd] = useState<Overdraft>({ facility: null })
  const [loading, setLoading] = useState(true)
  const [showApply, setShowApply] = useState(false)
  const [showOd, setShowOd] = useState(false)
  const [form, setForm] = useState({ amount: "", months: "24", purpose: "" })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const [openSchedule, setOpenSchedule] = useState<string | null>(null)
  const [schedule, setSchedule] = useState<Record<string, ScheduleData>>({})

  const load = useCallback(() => {
    Promise.all([
      fetch("/api/loans").then(r => r.json()).catch(() => []),
      fetch("/api/loans/apply").then(r => r.json()).catch(() => []),
      fetch("/api/overdraft").then(r => r.json()).catch(() => ({ facility: null })),
    ]).then(([l, a, o]) => { setLoans(Array.isArray(l) ? l : []); setApplications(Array.isArray(a) ? a : []); setOd(o) })
      .finally(() => setLoading(false))
  }, [])
  useEffect(load, [load])

  async function apply(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true); setResult(null)
    try {
      const res = await fetch("/api/loans/apply", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(form.amount), tenureMonths: parseInt(form.months), purpose: form.purpose }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      if (d.declined) {
        setResult({ ok: false, text: `Declined — ${d.reasons?.join(" ") || "eligibility criteria not met"}` })
      } else {
        setResult({ ok: true, text: `${d.decision === "APPROVE" ? "Pre-approved" : "Pre-approved with limit"}: ${money(d.approvedAmount)} @ ${d.rate}%. ${d.reasons?.join(" ") || ""} An admin will disburse shortly.` })
      }
      setShowApply(false); load()
    } catch (err: any) {
      setResult({ ok: false, text: err?.message || "Application failed" })
    } finally { setSubmitting(false) }
  }

  async function toggleSchedule(loanId: string) {
    if (openSchedule === loanId) { setOpenSchedule(null); return }
    setOpenSchedule(loanId)
    if (!schedule[loanId]) {
      const d: ScheduleData = await fetch(`/api/loans/${loanId}/schedule`).then(r => r.json())
      setSchedule(prev => ({ ...prev, [loanId]: d }))
    }
  }

  async function odAction(action: "enable" | "utilize" | "repay", amount?: number) {
    try {
      const res = await fetch("/api/overdraft", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, amount }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      load()
    } catch (err: any) { alert(err?.message || "Failed") }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Loans</h1><p className="text-[#8ea6b6] text-sm">Apply, track EMIs, view full amortization</p></div>
        <button onClick={() => setShowApply(!showApply)} className="bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] hover:from-[#d18a24] hover:to-[#e0a64a] text-[#1a1206] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Apply</button>
      </div>

      {result && (
        <div className={`flex items-start gap-2 p-4 rounded-xl border text-sm ${result.ok ? "bg-[#4ade80]/10 border-[#4ade80]/30 text-[#4ade80]" : "bg-[#f87171]/10 border-[#f87171]/30 text-[#f87171]"}`}>
          {result.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
          <span>{result.text}</span>
        </div>
      )}

      {/* Apply */}
      {showApply && (
        <div className="bg-[#0e2633] rounded-2xl p-5 border border-[#1e3d4d] space-y-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2"><Landmark className="w-4 h-4 text-[#f2bd68]" /> New Personal Loan</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input type="number" min={10000} placeholder="Amount ₹10,000 – ₹50,00,000" value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="bg-[#071a26] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:border-[#e8a33d]/50 focus:outline-none" />
            <select value={form.months} onChange={e => setForm(f => ({ ...f, months: e.target.value }))}
              className="bg-[#071a26] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:border-[#e8a33d]/50 focus:outline-none">
              {[12, 24, 36, 48, 60].map(m => <option key={m} value={m}>{m} months</option>)}
            </select>
          </div>
          <input placeholder="Purpose (optional)" value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
            className="w-full bg-[#071a26] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:border-[#e8a33d]/50 focus:outline-none" />
          <button onClick={apply} disabled={submitting} className="w-full bg-[#2dd4bf] hover:bg-[#14a390] text-[#04241f] rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Check Eligibility & Apply
          </button>
          <p className="text-[10px] text-[#8ea6b6]">Decisions use your Financial Health Score and income patterns. Every outcome includes its reasoning.</p>
        </div>
      )}

      {/* My applications under review / recent decisions */}
      {applications.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-xs uppercase tracking-widest text-[#2dd4bf] font-semibold">Your Applications</h3>
          {applications.map(a => (
            <div key={a.id} className="bg-[#0e2633] rounded-xl p-4 border border-[#1e3d4d] flex items-center justify-between text-sm">
              <div>
                <p className="text-white font-medium">{money(a.amount)} · {a.tenureMonths}m</p>
                {a.decisionReason && <p className="text-[11px] text-[#8ea6b6] mt-0.5 max-w-lg">{a.decisionReason}</p>}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${a.status === "APPLIED" ? "bg-[#fbbf24]/15 text-[#fbbf24]" : a.status === "DISBURSED" ? "bg-[#4ade80]/15 text-[#4ade80]" : "bg-[#f87171]/15 text-[#f87171]"}`}>{a.status}</span>
            </div>
          ))}
        </section>
      )}

      {/* Active loans + schedule viewer */}
      {loading ? <div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#e8a33d]" /></div> :
        loans.length === 0 ? (
          <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]"><Landmark className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" /><p className="text-[#8ea6b6]">No active loans</p></div>
        ) : (
          loans.map(l => (
            <div key={l.id} className="bg-[#0e2633] rounded-2xl p-5 border border-[#1e3d4d]">
              <div className="flex items-start justify-between mb-2">
                <span className="text-white font-medium capitalize">{l.type.toLowerCase()} loan</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${(l as any).collectionsStatus && (l as any).collectionsStatus !== "CURRENT" ? "bg-[#f87171]/20 text-[#f87171]" : "bg-[#2dd4bf]/20 text-[#2dd4bf]"}`}>
                  {(l as any).collectionsStatus !== "CURRENT" ? `COLLECTIONS: ${(l as any).collectionsStatus}` : l.status}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-2">
                <div><p className="text-[#8ea6b6]">Outstanding</p><p className="text-white font-semibold">{money(l.outstanding)}</p></div>
                <div><p className="text-[#8ea6b6]">EMI</p><p className="text-white font-semibold">{money(l.emiAmount)}</p></div>
                <div><p className="text-[#8ea6b6]">Rate</p><p className="text-white">{l.interestRate}%</p></div>
                <div><p className="text-[#8ea6b6]">Penalty accrued</p><p className={(l.penaltyAccrued ?? 0) > 0 ? "text-[#f87171]" : "text-white"}>{money(l.penaltyAccrued ?? 0)}</p></div>
              </div>
              <button onClick={() => toggleSchedule(l.id)} className="mt-3 text-xs text-[#f2bd68] hover:text-[#f6cf8f] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {openSchedule === l.id ? "Hide" : "View"} amortization schedule <ChevronDown className={`w-3 h-3 transition-transform ${openSchedule === l.id ? "rotate-180" : ""}`} />
              </button>
              {openSchedule === l.id && (
                <div className="mt-3 overflow-x-auto rounded-xl border border-[#1e3d4d]">
                  <table className="w-full text-xs">
                    <thead className="bg-[#071a26] text-[#8ea6b6]"><tr>{["#", "Due", "Opening", "Principal", "Interest", "Total", "Paid"].map(h => <th key={h} className="px-2 py-1.5 text-left font-medium">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-[#1e3d4d]/60">
                      {(schedule[l.id]?.installments || []).map(i => (
                        <tr key={i.no} className={i.paidAt ? "opacity-60" : ""}>
                          <td className="px-2 py-1.5 text-white">{i.no}</td>
                          <td className="px-2 py-1.5 text-[#8ea6b6]">{new Date(i.dueDate).toLocaleDateString()}</td>
                          <td className="px-2 py-1.5 text-[#c9d4de]">{money(i.openingBalance)}</td>
                          <td className="px-2 py-1.5 text-[#c9d4de]">{money(i.principal)}</td>
                          <td className="px-2 py-1.5 text-[#c9d4de]">{money(i.interest)}</td>
                          <td className="px-2 py-1.5 text-white font-medium">{money(i.total)}</td>
                          <td className="px-2 py-1.5">{i.paidAt ? <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80]" /> : <span className="text-[#8ea6b6]">—</span>}</td>
                        </tr>
                      ))}
                      {!schedule[l.id] && <tr><td colSpan={7} className="px-3 py-4 text-center text-[#8ea6b6]"><Loader2 className="w-4 h-4 animate-spin inline" /></td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}

      {/* Overdraft facility */}
      <section className="space-y-3">
        <h3 className="text-xs uppercase tracking-widest text-[#2dd4bf] font-semibold flex items-center gap-2"><Wallet className="w-4 h-4" /> Overdraft Credit Line</h3>
        {!od.facility ? (
          <div className="bg-[#0e2633] rounded-2xl p-5 border border-[#1e3d4d] space-y-3">
            <p className="text-sm text-[#8ea6b6]">A revolving credit line tied to your account — interest charged only on what you actually use.</p>
            <OdEnableForm onDone={load} />
          </div>
        ) : (
          <div className="bg-[#0e2633] rounded-2xl p-5 border border-[#1e3d4d] space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div><p className="text-[#8ea6b6]">Limit</p><p className="text-white font-bold">{money(od.facility.limit)}</p></div>
              <div><p className="text-[#8ea6b6]">Utilised</p><p className="text-white font-bold">{money(od.facility.utilized)}</p></div>
              <div><p className="text-[#8ea6b6]">Interest accrued</p><p className="text-[#fbbf24] font-bold">{money(od.facility.accruedInterest)}</p></div>
              <div><p className="text-[#8ea6b6]">Available</p><p className="text-[#2dd4bf] font-bold">{money(od.available ?? od.facility.limit - od.facility.utilized)}</p></div>
            </div>
            <OdActions onDone={load} />
          </div>
        )}
        {false && setShowOd !== undefined && setShowOd(true) && <span />}
      </section>
    </div>
  )
}

function OdEnableForm({ onDone }: { onDone: () => void }) {
  const [limit, setLimit] = useState("")
  const [busy, setBusy] = useState(false)
  return (
    <div className="flex gap-2">
      <input type="number" min={5000} max={500000} placeholder="Requested limit (₹5,000–₹5L)" value={limit}
        onChange={e => setLimit(e.target.value)}
        className="flex-1 bg-[#071a26] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:border-[#e8a33d]/50 focus:outline-none" />
      <button disabled={busy || !limit} onClick={async () => {
        setBusy(true)
        try { await fetch("/api/overdraft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "enable", limit: parseFloat(limit) }) }); onDone() }
        finally { setBusy(false) }
      }} className="bg-[#2dd4bf] text-[#04241f] px-4 rounded-lg text-sm font-semibold disabled:opacity-60">{busy ? "…" : "Activate"}</button>
    </div>
  )
}

function OdActions({ onDone }: { onDone: () => void }) {
  const [amount, setAmount] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const act = async (action: "utilize" | "repay") => {
    if (!amount) return
    setBusy(action)
    try {
      await fetch("/api/overdraft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, amount: parseFloat(amount) }) })
      setAmount(""); onDone()
    } finally { setBusy(null) }
  }
  return (
    <div className="flex gap-2 items-center">
      <input type="number" placeholder="Amount ₹" value={amount} onChange={e => setAmount(e.target.value)}
        className="flex-1 bg-[#071a26] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:border-[#e8a33d]/50 focus:outline-none" />
      <button disabled={!!busy} onClick={() => act("utilize")} className="bg-[#2dd4bf] text-[#04241f] px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">{busy === "utilize" ? "…" : "Draw"}</button>
      <button disabled={!!busy} onClick={() => act("repay")} className="border border-[#1e3d4d] text-white px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">{busy === "repay" ? "…" : "Repay"}</button>
    </div>
  )
}