"use client"

import { useEffect, useState } from "react"
import { CalendarDays, Loader2, AlertTriangle } from "lucide-react"

interface ProjectionDay {
  date: string
  inflow: number
  outflow: number
  closing: number
  events: string[]
}
interface CashflowData {
  startBalance: number
  shortfall: { date: string; closing: number; cause: string } | null
  days: ProjectionDay[]
}

const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`

export function CashflowWidget() {
  const [data, setData] = useState<CashflowData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetch("/api/cashflow?days=45")
      .then((r) => r.json())
      .then((d) => { if (alive && d?.days) setData(d) })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return (
    <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <CalendarDays className="h-5 w-5 text-[#2dd4bf]" />
        <h3 className="font-semibold text-white text-sm">Cash-flow Forecast · next 45 days</h3>
      </div>

      {loading ? (
        <div className="py-6 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-[#e8a33d]" /></div>
      ) : !data ? (
        <p className="text-xs text-[#8ea6b6] py-4 text-center">Add some transactions to unlock your forecast.</p>
      ) : (
        <>
          {data.shortfall && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-[#f87171]/10 border border-[#f87171]/30 text-xs text-[#f87171]">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>Shortfall warning:</strong> {data.shortfall.cause} Projected balance: {money(data.shortfall.closing)}.
              </span>
            </div>
          )}

          {/* Mini closing-balance sparkline bars */}
          <div className="flex items-end gap-[2px] h-16 mb-4">
            {data.days.filter((_, i) => i % 2 === 0).map((d) => {
              const minC = Math.min(...data.days.map(x => x.closing), 0)
              const maxC = Math.max(...data.days.map(x => x.closing), data.startBalance)
              const range = maxC - minC || 1
              const pct = Math.max(4, ((d.closing - minC) / range) * 100)
              const neg = d.closing < 0
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center group relative" title={`${new Date(d.date).toLocaleDateString("en-IN")}: ${money(d.closing)}`}>
                  <div className={`w-full rounded-t ${neg ? "bg-[#f87171]" : "bg-gradient-to-t from-[#e8a33d]/50 to-[#f2bd68]"}`} style={{ height: `${neg ? 10 : pct}%` }} />
                </div>
              )
            })}
          </div>

          {/* Next significant events */}
          <div className="space-y-1.5">
            {data.days
              .filter(d => d.events.length > 0)
              .slice(0, 4)
              .map((d) => (
                <div key={d.date} className="flex items-start justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <span className="text-white">{new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    <span className="text-[#8ea6b6] ml-2 truncate inline-block max-w-[180px] align-bottom">{d.events.join(" · ")}</span>
                  </div>
                  <span className={`shrink-0 font-medium ${d.closing < 0 ? "text-[#f87171]" : "text-[#c9d4de]"}`}>{money(d.closing)}</span>
                </div>
              ))}
            {data.days.every(d => d.events.length === 0) && (
              <p className="text-xs text-[#8ea6b6] py-2">No scheduled income or debits detected in the horizon.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}