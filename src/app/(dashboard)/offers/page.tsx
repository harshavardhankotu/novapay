"use client"
import { useState, useEffect } from "react"
import { Tag, Gift, Zap, ShoppingBag, Coffee, Airplay } from "lucide-react"

const catIcons: Record<string, any> = { shopping: ShoppingBag, food: Coffee, travel: Airplay, entertainment: Zap, general: Gift }

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([]); const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/offers").then(r => r.json()).then(d => { setOffers(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const redeem = async (id: string) => {
    const res = await fetch("/api/offers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    if (res.ok) setOffers(prev => prev.map(o => o.id === id ? { ...o, status: "REDEEMED" } : o))
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Offers & Deals</h1><p className="text-[#8ea6b6] text-sm">Exclusive discounts · Cashback · Partner offers</p></div>
      <div className="bg-gradient-to-r from-orange-900/40 to-zinc-900 rounded-2xl p-6 border border-[#1e3d4d]">
        <Tag className="w-6 h-6 text-orange-400 mb-2" />
        <p className="text-white font-semibold">{offers.filter(o => o.status === "ACTIVE").length} active offers</p>
        <p className="text-[#8ea6b6] text-sm">{offers.filter(o => o.status === "REDEEMED").length} redeemed</p>
      </div>
      {loading ? <div className="text-center text-[#8ea6b6] py-8">Loading...</div> :
        offers.length === 0 ? <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]"><Gift className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" /><p className="text-[#8ea6b6]">No offers available</p></div> :
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map(o => {
            const Icon = catIcons[o.category] || Gift
            return <div key={o.id} className={`bg-[#0e2633] rounded-2xl p-5 border ${o.status === "REDEEMED" ? "border-[#1e3d4d] opacity-60" : "border-[#1e3d4d]"}`}>
              <div className="flex items-start justify-between mb-3"><Icon className="w-5 h-5 text-orange-400" /><span className={`text-xs px-2 py-0.5 rounded-full ${o.status === "ACTIVE" ? "bg-[#2dd4bf]/20 text-[#2dd4bf]" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{o.status}</span></div>
              <p className="text-white font-semibold">{o.title}</p>
              <p className="text-[#8ea6b6] text-sm mt-1">{o.description}</p>
              <div className="flex items-center justify-between mt-3"><span className="text-lg font-bold text-[#2dd4bf]">{o.discount}</span>
                {o.status === "ACTIVE" ? <button onClick={() => redeem(o.id)} className="bg-[#2dd4bf] text-white px-4 py-1.5 rounded-lg text-xs font-medium">Redeem</button> : <span className="text-[#8ea6b6] text-xs">Expired</span>}
              </div>
              {o.code && <p className="text-[#8ea6b6] text-xs mt-2 font-mono">Code: {o.code}</p>}
              <p className="text-[#8ea6b6] text-xs mt-1">Valid till {new Date(o.validTill).toLocaleDateString()}</p>
            </div>
          })}
        </div>
      }
    </div>
  )
}
