"use client"
import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"

export default function GoldPage() {
  const [grams, setGrams] = useState(0)
  const [loading, setLoading] = useState(true)
  const buyPrice = 8799; const sellPrice = 8650; const priceChange = 1.2
  const [amount, setAmount] = useState("")

  useEffect(() => {
    fetch("/api/gold").then(r => r.json()).then(d => { setGrams(d.grams || 0); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const buyGold = async () => {
    const g = parseFloat(amount)
    if (!g || g <= 0) return
    const res = await fetch("/api/gold", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grams: grams + g }),
    })
    if (res.ok) { setGrams(prev => prev + g); setAmount("") }
  }

  const sellGold = async () => {
    const g = parseFloat(amount)
    if (!g || g <= 0 || g > grams) return
    const res = await fetch("/api/gold", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grams: grams - g }),
    })
    if (res.ok) { setGrams(prev => prev - g); setAmount("") }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Digital Gold</h1><p className="text-[#8ea6b6] text-sm">24K 999.9 purity · MMTC-PAMP certified · Zero storage fees</p></div>

      <div className="bg-gradient-to-r from-amber-900/40 to-zinc-900 rounded-2xl p-6 border border-[#1e3d4d]">
        <div className="flex items-center gap-3 mb-3"><Sparkles className="w-6 h-6 text-amber-400" /><p className="text-white font-semibold">Your Gold Balance</p></div>
        <p className="text-3xl font-bold text-white">{loading ? "..." : `${grams.toFixed(2)} g`}</p>
        <p className="text-[#8ea6b6] text-sm mt-1">≈ ₹{(grams * sellPrice).toLocaleString("en-IN")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] text-center">
          <p className="text-[#8ea6b6] text-xs">Buy Price</p>
          <p className="text-white text-xl font-bold">₹{buyPrice.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] text-center">
          <p className="text-[#8ea6b6] text-xs">Sell Price</p>
          <p className="text-white text-xl font-bold">₹{sellPrice.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-3">
        <h3 className="text-white font-semibold">Trade Gold</h3>
        <input type="number" step="0.1" placeholder="Grams (e.g. 0.5)" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:outline-none focus:border-amber-500" />
        {amount && <p className="text-[#8ea6b6] text-xs">≈ ₹{(parseFloat(amount || "0") * buyPrice).toLocaleString("en-IN")}</p>}
        <div className="flex gap-3">
          <button onClick={buyGold} className="flex-1 bg-amber-500 hover:bg-amber-600 text-black rounded-lg py-2.5 text-sm font-medium">Buy</button>
          <button onClick={sellGold} className="flex-1 bg-[#0e2633] hover:bg-[#0e2633] text-white rounded-lg py-2.5 text-sm font-medium">Sell</button>
        </div>
      </div>
    </div>
  )
}
