"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
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

  const load = () => {
    setLoading(true)
    setError("")
    fetch("/api/admin/analytics")
      .then(async (r) => {
        if (r.status === 403) throw new Error("Admin access required. Log in with an admin account.")
        if (!r.ok) throw new Error("Failed to load analytics")
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

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
    </div>
  )
}