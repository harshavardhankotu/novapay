"use client"

import { useEffect, useState, useCallback } from "react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users, Activity, AlertTriangle, BarChart3, Mail, MousePointerClick,
  TrendingUp, Database, RefreshCw, Loader2,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Analytics {
  platform: {
    totalUsers: number; activeUsers: number; pendingKyc: number
    totalAccounts: number; totalCards: number; totalTransactions: number; totalVolume: number
  }
  revenue: {
    waitlistTotal: number; waitlistLast14d: number
    dailyWaitlist: { date: string; count: number }[]
    recentWaitlist: { id: string; email: string; source: string; createdAt: string }[]
    clickTotal: number; clicksLast14d: number
    clicksBySlot: { slotId: string; clicks: number }[]
    recentClicks: { id: string; slotId: string; createdAt: string; user?: { name: string; email: string } | null }[]
  }
}

const SLOT_LABELS: Record<string, string> = {
  "credit-card-premium": "Premium Credit Cards",
  "personal-loan": "Personal Loans",
  "term-insurance": "Term Insurance",
  "index-funds": "Start an SIP",
}

export default function AdminPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    let alive = true
    fetch("/api/admin/analytics")
      .then(async (r) => {
        if (!alive) return
        if (r.status === 403) throw new Error("Admin access required. Log in with an admin account.")
        if (!r.ok) throw new Error("Failed to load analytics")
        return r.json()
      })
      .then((d) => { if (alive && d) setData(d) })
      .catch((e) => { if (alive) setError(e.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [reloadTick])

  const load = () => {
    setError("")
    setLoading(true)
    setReloadTick((t) => t + 1)
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto py-20 text-center text-[#8ea6b6]">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-[#e8a33d]" /> Loading analytics...
    </div>
  )

  if (error) return (
    <div className="max-w-lg mx-auto mt-16 p-6 rounded-2xl bg-[#0e2633] border border-[#1e3d4d] text-center space-y-4 animate-fade-in">
      <AlertTriangle className="h-10 w-10 text-[#fbbf24] mx-auto" />
      <p className="text-white font-semibold">Restricted area</p>
      <p className="text-sm text-[#8ea6b6]">{error}</p>
      <Button variant="outline" size="sm" onClick={load} className="gap-2 border-[#1e3d4d] text-[#c9d4de] hover:bg-[#0e2633]">
        <RefreshCw className="h-4 w-4" /> Retry
      </Button>
    </div>
  )

  if (!data) return null

  const maxDaily = Math.max(1, ...data.revenue.dailyWaitlist.map((d) => d.count))

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Analytics</h1>
          <p className="text-sm text-[#8ea6b6] mt-0.5">Live platform & revenue metrics</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-1.5 border-[#1e3d4d] text-[#c9d4de] hover:bg-[#0e2633]">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Revenue pulse */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#2dd4bf] flex items-center gap-2">
          <TrendingUp className="h-4 w-4" /> Revenue Pulse
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Waitlist Signups", value: data.revenue.waitlistTotal.toLocaleString(), sub: `+${data.revenue.waitlistLast14d} in last 14 days`, icon: Mail },
            { label: "Affiliate Clicks", value: data.revenue.clickTotal.toLocaleString(), sub: `${data.revenue.clicksLast14d} in last 14 days`, icon: MousePointerClick },
            { label: "Registered Users", value: data.platform.totalUsers.toLocaleString(), sub: `${data.platform.activeUsers} active`, icon: Users },
            { label: "KYC Pending", value: data.platform.pendingKyc.toLocaleString(), sub: "unverified users", icon: AlertTriangle },
          ].map((s, i) => (
            <div key={s.label} className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-5 shadow-sm animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#e8a33d]/15 to-[#2dd4bf]/15 flex items-center justify-center">
                  <s.icon className="h-4 w-4 text-[#f2bd68]" />
                </div>
                <span className="text-xs text-[#8ea6b6]">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-[#4ade80] mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Waitlist growth chart */}
        <section className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white text-sm">Waitlist — last 14 days</h3>
            <BarChart3 className="h-4 w-4 text-[#8ea6b6]" />
          </div>
          {data.revenue.waitlistTotal === 0 ? (
            <p className="text-sm text-[#8ea6b6] py-10 text-center">No signups yet. Share the landing page to start collecting leads.</p>
          ) : (
            <>
              <div className="flex items-end gap-1 h-32">
                {data.revenue.dailyWaitlist.map((d) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-[#e8a33d]/40 to-[#f2bd68] min-h-[3px] transition-all"
                      style={{ height: `${(d.count / maxDaily) * 100}%` }}
                      title={`${d.date}: ${d.count}`}
                    />
                    <span className="text-[9px] text-[#8ea6b6]">{d.date.slice(8)}</span>
                    {d.count > 0 && (
                      <span className="absolute -top-5 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white bg-[#071a26] px-1.5 py-0.5 rounded border border-[#1e3d4d]">{d.count}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-1.5">
                {data.revenue.recentWaitlist.slice(0, 4).map((w) => (
                  <div key={w.id} className="flex items-center justify-between text-xs">
                    <span className="text-[#c9d4de] truncate max-w-[60%]">{w.email}</span>
                    <span className="text-[#8ea6b6]">{new Date(w.createdAt).toLocaleDateString()} · {w.source}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Affiliate performance */}
        <section className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white text-sm">Affiliate clicks by slot</h3>
            <MousePointerClick className="h-4 w-4 text-[#8ea6b6]" />
          </div>
          {data.revenue.clicksBySlot.length === 0 ? (
            <p className="text-sm text-[#8ea6b6] py-10 text-center">No clicks yet. They appear here the moment someone taps a partner offer.</p>
          ) : (
            <div className="space-y-3">
              {data.revenue.clicksBySlot.map((s) => {
                const pct = Math.round((s.clicks / Math.max(1, data.revenue.clickTotal)) * 100)
                return (
                  <div key={s.slotId}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#c9d4de]">{SLOT_LABELS[s.slotId] || s.slotId}</span>
                      <span className="text-[#8ea6b6]">{s.clicks} · {pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#071a26] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#14a390]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {data.revenue.recentClicks.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[#1e3d4d] space-y-1.5">
              {data.revenue.recentClicks.slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <span className="text-[#c9d4de]">{SLOT_LABELS[c.slotId] || c.slotId}</span>
                  <span className="text-[#8ea6b6]">{c.user?.name || "Guest"} · {new Date(c.createdAt).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Platform stats */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#2dd4bf] mb-3 flex items-center gap-2">
          <Database className="h-4 w-4" /> Platform
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Accounts", value: data.platform.totalAccounts },
            { label: "Cards Issued", value: data.platform.totalCards },
            { label: "Transactions", value: data.platform.totalTransactions },
            { label: "Net Volume", value: formatCurrency(data.platform.totalVolume) },
          ].map((s) => (
            <div key={s.label} className="bg-[#0e2633]/50 rounded-2xl border border-[#1e3d4d] p-5">
              <p className="text-xs text-[#8ea6b6]">{s.label}</p>
              <p className="text-xl font-bold text-white mt-1">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</p>
            </div>
          ))}
        </div>
      </section>

      <RatesPanel />
      <LoanApplicationsPanel />
      <StrCasesPanel />
    </div>
  )
}

function StrCasesPanel() {
  const [cases, setCases] = useState<any[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [note, setNote] = useState<Record<string, string>>({})

  const load = useCallback(() => {
    fetch("/api/str-cases").then(r => r.json()).then(d => setCases(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])
  useEffect(load, [load])

  async function act(caseId: string, action: string) {
    setBusy(caseId)
    try {
      await fetch("/api/str-cases", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, action, note: note[caseId] }),
      })
      load()
    } finally { setBusy(null) }
  }

  const statusColor = (s: string) =>
    s === "ESCALATED" ? "bg-[#f87171]/20 text-[#f87171]" :
    s === "CLEARED" ? "bg-[#4ade80]/20 text-[#4ade80]" :
    s === "UNDER_REVIEW" ? "bg-[#fbbf24]/20 text-[#fbbf24]" : "bg-[#e8a33d]/20 text-[#f2bd68]"

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[#2dd4bf]">STR / Compliance Cases</h2>
      {!cases.length ? (
        <p className="text-sm text-[#8ea6b6]">No open compliance cases.</p>
      ) : (
        <div className="space-y-3">
          {cases.map(c => (
            <div key={c.id} className="bg-[#0e2633]/50 rounded-xl border border-[#1e3d4d] p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(c.status)}`}>{c.status.replace("_", " ")}</span>
                <span className="text-[11px] text-[#8ea6b6]">{c.user?.email} · {new Date(c.openedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-white font-medium">{c.rule}</p>
              <p className="text-xs text-[#8ea6b6]">{c.summary}</p>
              {c.status !== "CLEARED" && c.status !== "ESCALATED" && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {c.status === "OPEN" && (
                    <Button size="sm" variant="outline" disabled={busy === c.id} onClick={() => act(c.id, "review")}
                      className="h-8 border-[#1e3d4d] text-[#c9d4de] hover:bg-[#071a26]">Start Review</Button>
                  )}
                  <Button size="sm" disabled={busy === c.id} onClick={() => act(c.id, "clear")}
                    className="h-8 bg-gradient-to-r from-[#4ade80] to-[#22c55e] hover:from-[#22c55e] hover:to-[#16a34a] text-[#052e16] border-0">Clear</Button>
                  <Button size="sm" variant="outline" disabled={busy === c.id} onClick={() => act(c.id, "escalate")}
                    className="h-8 border-[#f87171]/40 text-[#f87171] hover:bg-[#f87171]/10">Escalate</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function LoanApplicationsPanel() {
  const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`
  const [apps, setApps] = useState<any[]>([])
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState("")

  const load = useCallback(() => {
    fetch("/api/admin/loans/decide").then(r => r.json()).then(d => setApps(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])
  useEffect(load, [load])

  async function decide(id: string, action: "approve" | "decline") {
    setBusy(id)
    setMsg("")
    try {
      const res = await fetch("/api/admin/loans/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, action, note: notes[id] || (action === "approve" ? "Sanctioned after review." : "") }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setMsg(`${action === "approve" ? "Disbursed" : "Declined"} ✓`)
      load()
    } catch (err: any) {
      setMsg(err?.message || "Failed")
    } finally { setBusy(null) }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[#2dd4bf] flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" /> Loan Applications Awaiting Decision
      </h2>
      {!apps.length ? (
        <p className="text-sm text-[#8ea6b6]">No applications in the queue.</p>
      ) : (
        <div className="space-y-3">
          {apps.map(a => {
            const elig = (() => { try { return JSON.parse(a.eligibilityJson || "{}") } catch { return {} } })()
            return (
              <div key={a.id} className="bg-[#0e2633]/50 rounded-xl border border-[#1e3d4d] p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white font-medium">{a.user?.name || a.userId} · {money(a.amount)} · {a.tenureMonths}m</span>
                  {elig.healthScore != null && <Badge variant={elig.healthScore >= 60 ? "success" : elig.healthScore >= 40 ? "warning" : "destructive"}>Score {elig.healthScore}</Badge>}
                </div>
                {elig.reasons && Array.isArray(elig.reasons) && (
                  <ul className="text-[11px] text-[#8ea6b6] list-disc pl-4 space-y-0.5">
                    {elig.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
                  </ul>
                )}
                <input placeholder="Decision note (required to decline)" value={notes[a.id] || ""}
                  onChange={e => setNotes(n => ({ ...n, [a.id]: e.target.value }))}
                  className="w-full h-9 px-3 rounded-lg bg-[#071a26] border border-[#1e3d4d] text-xs text-white focus:border-[#e8a33d]/50 focus:outline-none" />
                <div className="flex gap-2">
                  <Button size="sm" disabled={busy === a.id} onClick={() => decide(a.id, "approve")}
                    className="bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] hover:from-[#d18a24] hover:to-[#e0a64a] text-[#1a1206] border-0">Approve & Disburse</Button>
                  <Button size="sm" variant="outline" disabled={busy === a.id} onClick={() => decide(a.id, "decline")}
                    className="border-[#f87171]/40 text-[#f87171] hover:bg-[#f87171]/10">Decline</Button>
                  {msg && busy === null && <span className="text-xs self-center text-[#4ade80]">{msg}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function RatesPanel() {
  const [slabs, setSlabs] = useState<{ active: any[]; retired: any[] } | null>(null)
  const [form, setForm] = useState({ product: "FD", minAmount: "", maxAmount: "", tenureMonths: "12", rate: "" })
  const [msg, setMsg] = useState("")
  const [saving, setSaving] = useState(false)

  const load = React.useCallback(() => {
    fetch("/api/admin/rates").then(r => r.json()).then(setSlabs).catch(() => {})
  }, [])
  useEffect(load, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setMsg("")
    try {
      const res = await fetch("/api/admin/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setMsg(`Saved: ${form.product} ${form.rate}% slab active (previous overlapping versions retired)`)
      setForm(f => ({ ...f, rate: "" }))
      load()
    } catch (err: any) {
      setMsg(err?.message || "Failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[#2dd4bf] mb-1">Interest Rate Table</h2>
      {!slabs ? <p className="text-sm text-[#8ea6b6]">Loading slabs…</p> : (
        <>
          <div className="rounded-2xl border border-[#1e3d4d] overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[#0e2633] text-[#8ea6b6]">
                <tr>{["Product", "Amount Range", "Tenure", "Rate %", "Effective From"].map(h => <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[#1e3d4d]/60">
                {slabs.active.map((s: any) => (
                  <tr key={s.id} className="bg-[#0e2633]/30">
                    <td className="px-3 py-2 text-white font-medium">{s.product}</td>
                    <td className="px-3 py-2 text-[#c9d4de]">₹{s.minAmount.toLocaleString("en-IN")} – {s.maxAmount != null ? `₹${s.maxAmount.toLocaleString("en-IN")}` : "∞"}</td>
                    <td className="px-3 py-2 text-[#8ea6b6]">{s.tenureMonths ?? "any"}m</td>
                    <td className="px-3 py-2 text-[#f2bd68] font-semibold">{s.rate}%</td>
                    <td className="px-3 py-2 text-[#8ea6b6]">{new Date(s.effectiveFrom).toLocaleDateString()}</td>
                  </tr>
                ))}
                {slabs.active.length === 0 && <tr><td colSpan={5} className="px-3 py-4 text-center text-[#8ea6b6]">No active slabs — defaults apply (FD 7%, RD 6.5%, Savings 3.5%)</td></tr>}
              </tbody>
            </table>
          </div>

          <form onSubmit={save} className="flex flex-wrap items-end gap-3 bg-[#0e2633]/50 border border-[#1e3d4d] rounded-2xl p-4">
            <select value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))}
              className="h-10 px-3 rounded-lg bg-[#071a26] border border-[#1e3d4d] text-white text-sm">
              {["FD", "RD", "SAVINGS"].map(p => <option key={p}>{p}</option>)}
            </select>
            {[["minAmount", "Min ₹"], ["maxAmount", "Max ₹ (opt)"], ["tenureMonths", "Tenure m (opt)"], ["rate", "Rate %"]].map(([k, ph]) => (
              <input key={k} type="number" step="0.01" placeholder={ph} value={(form as any)[k]}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="h-10 w-28 px-3 rounded-lg bg-[#071a26] border border-[#1e3d4d] text-white text-sm focus:border-[#e8a33d]/50 focus:outline-none" />
            ))}
            <Button size="sm" disabled={saving} className="bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] hover:from-[#d18a24] hover:to-[#e0a64a] text-[#1a1206] border-0">
              {saving ? "Saving…" : "Publish Slab"}
            </Button>
            {msg && <span className={`text-xs ${msg.startsWith("Saved") ? "text-[#4ade80]" : "text-[#f87171]"}`}>{msg}</span>}
            <span className="w-full text-[10px] text-[#8ea6b6]">Publishing retires overlapping versions — full history retained.</span>
          </form>

          {slabs.retired.length > 0 && (
            <details className="text-xs text-[#8ea6b6]">
              <summary className="cursor-pointer">History ({slabs.retired.length} retired)</summary>
              <div className="mt-2 space-y-1">
                {slabs.retired.slice(0, 8).map((s: any) => (
                  <div key={s.id} className="flex gap-3"><span className="text-white/70">{s.product} {s.rate}%</span><span>₹{s.minAmount.toLocaleString("en-IN")}+</span><span>{new Date(s.retiredAt).toLocaleDateString()}</span></div>
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </section>
  )
}