"use client"
import { useState, useEffect } from "react"
import { Wifi, Signal } from "lucide-react"

export default function EsimPage() {
  const [esims, setEsims] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"plans" | "active">("plans")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/esim").then(r => r.json()).then(d => {
      setEsims(d.filter((e: any) => e.isPurchased))
      setPlans(d.filter((e: any) => !e.isPurchased))
      if (d.length === 0) {
        setPlans([
          { id: "plan_1", region: "Asia Pacific", data: "3 GB", validity: "7 days", price: 499 },
          { id: "plan_2", region: "Europe", data: "5 GB", validity: "15 days", price: 999 },
          { id: "plan_3", region: "USA & Canada", data: "10 GB", validity: "30 days", price: 1499 },
          { id: "plan_4", region: "Global", data: "1 GB", validity: "5 days", price: 299 },
          { id: "plan_5", region: "Middle East", data: "2 GB", validity: "7 days", price: 399 },
        ])
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const purchaseEsim = async (p: any) => {
    const res = await fetch("/api/esim", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ region: p.region, data: p.data, validity: p.validity, price: p.price }),
    })
    if (res.ok) { const e = await res.json(); setEsims(prev => [...prev, e]); setPlans(prev => prev.filter(x => x.id !== p.id)) }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">eSIM</h1><p className="text-[#8ea6b6] text-sm">Global data plans · 190+ countries · Instant activation</p></div>

      <div className="flex gap-2">
        <button onClick={() => setActiveTab("plans")} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "plans" ? "bg-[#2dd4bf] text-white" : "bg-[#0e2633] text-[#8ea6b6]"}`}>Plans</button>
        <button onClick={() => setActiveTab("active")} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "active" ? "bg-[#2dd4bf] text-white" : "bg-[#0e2633] text-[#8ea6b6]"}`}>Active ({esims.length})</button>
      </div>

      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map(p => (
            <div key={p.id} className="bg-[#0e2633] rounded-2xl p-5 border border-[#1e3d4d] hover:border-[#1e3d4d]">
              <div className="flex items-center gap-2 mb-2"><Signal className="w-5 h-5 text-[#2dd4bf]" /><span className="text-white font-semibold">{p.region}</span></div>
              <div className="flex gap-4 text-sm text-[#8ea6b6] mb-3">
                <span>📶 {p.data}</span><span>⏱ {p.validity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-lg">₹{p.price}</span>
                <button onClick={() => purchaseEsim(p)} className="bg-[#2dd4bf] hover:bg-[#14a390] text-white px-4 py-1.5 rounded-lg text-sm">Buy</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "active" && (
        esims.length === 0 ? (
          <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]">
            <Wifi className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" />
            <p className="text-[#8ea6b6]">No active eSIMs</p>
          </div>
        ) : (
          esims.map(e => (
            <div key={e.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{e.region}</p>
                <p className="text-[#8ea6b6] text-xs">{e.data} · {e.validity}</p>
              </div>
              <span className="text-[#2dd4bf] text-sm font-medium">Active</span>
            </div>
          ))
        )
      )}
    </div>
  )
}
