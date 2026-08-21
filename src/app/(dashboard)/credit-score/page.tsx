"use client"
import { useState, useEffect } from "react"
import { TrendingUp, RefreshCw, Info } from "lucide-react"

export default function CreditScorePage() {
  const [data, setData] = useState<any>(null); const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/credit-score").then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const scoreColor = (s: number) => s >= 750 ? "text-[#2dd4bf]" : s >= 650 ? "text-yellow-400" : "text-red-400"

  if (loading) return <div className="max-w-2xl mx-auto p-6 text-center text-[#8ea6b6]">Loading...</div>
  if (!data) return null

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Credit Score</h1><p className="text-[#8ea6b6] text-sm">Powered by CIBIL · Updated {new Date(data.reportDate).toLocaleDateString()}</p></div>
        <button className="text-[#2dd4bf] text-sm flex items-center gap-1"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>
      <div className="bg-gradient-to-r from-blue-900/40 to-zinc-900 rounded-2xl p-8 border border-[#1e3d4d] text-center">
        <p className="text-[#8ea6b6] text-sm mb-1">CIBIL Score</p>
        <p className={`text-6xl font-bold ${scoreColor(data.score)}`}>{data.score}</p>
        <p className="text-[#8ea6b6] text-sm mt-1">out of {data.scoreRange}</p>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[{l:"Poor",r:300,c:"red-500"},{l:"Fair",r:550,c:"orange-500"},{l:"Good",r:650,c:"yellow-500"},{l:"Very Good",r:750,c:"green-500"},{l:"Excellent",r:850,c:"emerald-500"}].map(s => (
          <div key={s.l} className="text-center"><div className={`h-2 rounded-full bg-${s.c} ${data.score >= s.r ? "opacity-100" : "opacity-20"}`} /><p className="text-[#8ea6b6] text-xs mt-1">{s.l}</p></div>
        ))}
      </div>
      <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d]">
        <h3 className="text-white font-semibold mb-3">Score Factors</h3>
        {data.factors && Object.entries(data.factors as Record<string, number>).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between py-2 border-b border-[#1e3d4d] last:border-0">
            <span className="text-[#8ea6b6] text-sm capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
            <div className="flex items-center gap-2"><div className="w-24 bg-[#0e2633] h-1.5 rounded-full"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${v}%` }} /></div><span className="text-[#8ea6b6] text-xs">{v}%</span></div>
          </div>
        ))}
      </div>
      <div className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 mt-0.5" />
        <p className="text-[#8ea6b6] text-sm">Check your CIBIL score monthly. Scores above 750 get preferred interest rates on loans.</p>
      </div>
    </div>
  )
}
