"use client"

import { useEffect, useState } from "react"
import { HeartPulse, Loader2, ChevronDown } from "lucide-react"

interface FactorScore {
  key: string
  label: string
  score: number
  weight: number
  explanation: string
}

interface ScoreData {
  total: number
  factors: FactorScore[]
  history: { date: string; total: number }[]
}

function scoreColor(total: number): string {
  if (total >= 75) return "#4ade80"
  if (total >= 50) return "#fbbf24"
  return "#f87171"
}

export function HealthScoreWidget() {
  const [data, setData] = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    let alive = true
    fetch("/api/score")
      .then((r) => r.json())
      .then((d: ScoreData) => { if (alive && d && typeof d.total === "number") setData(d) })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return (
    <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <HeartPulse className="h-5 w-5 text-[#ff8a70]" />
          <h3 className="font-semibold text-white text-sm">Financial Health</h3>
        </div>
        {data && data.history.length > 1 && (
          <span className="text-[10px] text-[#8ea6b6]">
            trend: {data.history[0].total} → {data.history[data.history.length - 1].total}
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-6 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-[#e8a33d]" /></div>
      ) : !data ? (
        <p className="text-xs text-[#8ea6b6] py-4 text-center">Not enough activity yet to score your financial health.</p>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0">
              <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#071a26" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={scoreColor(data.total)} strokeWidth="3"
                  strokeDasharray={`${data.total} ${100 - data.total}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                {data.total}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${scoreColor(data.total)}`}>
                {data.total >= 75 ? "Excellent shape" : data.total >= 50 ? "Steady, room to grow" : "Needs attention"}
              </p>
              <button onClick={() => setExpanded(!expanded)} className="text-[11px] text-[#f2bd68] hover:text-[#f6cf8f] flex items-center gap-1 mt-1">
                {expanded ? "Hide" : "Why this score"} <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          {!expanded ? (
            <div className="mt-3 space-y-1.5">
              {data.factors.map((f) => (
                <div key={f.key} className="flex items-center gap-2">
                  <span className="text-[10px] text-[#8ea6b6] w-24 shrink-0 truncate">{f.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-[#071a26] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${f.score}%`, backgroundColor: scoreColor(f.score) }} />
                  </div>
                  <span className="text-[10px] text-white/70 w-7 text-right">{Math.round(f.score)}</span>
                </div>
              ))}
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.factors.map((f) => (
                <li key={f.key} className="border-l-2 pl-3 py-1" style={{ borderColor: scoreColor(f.score) }}>
                  <p className="text-[11px] font-medium text-white">{f.label} — {Math.round(f.score)}/100 <span className="text-[#8ea6b6] font-normal">({Math.round(f.weight * 100)}% weight)</span></p>
                  <p className="text-[11px] text-[#8ea6b6] leading-relaxed mt-0.5">{f.explanation}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}