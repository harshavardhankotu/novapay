"use client"
import { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react"

const cryptoPrices: Record<string, { price: number; change: number }> = {
  BTC: { price: 9450000, change: 2.4 }, ETH: { price: 345000, change: -1.2 }, SOL: { price: 18500, change: 5.7 },
  USDT: { price: 87, change: 0.01 }, MATIC: { price: 78, change: -0.8 },
}

export default function WealthPage() {
  const [holdings, setHoldings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showBuy, setShowBuy] = useState(false)
  const [buyCoin, setBuyCoin] = useState("BTC")
  const [buyAmount, setBuyAmount] = useState("")

  useEffect(() => {
    fetch("/api/crypto").then(r => r.json()).then(d => {
      if (d.length === 0) {
        setHoldings([
          { id: "h1", userId: "", coin: "BTC", amount: 0.0023, avgPrice: 9200000 },
          { id: "h2", userId: "", coin: "ETH", amount: 0.15, avgPrice: 340000 },
          { id: "h3", userId: "", coin: "SOL", amount: 1.5, avgPrice: 17500 },
        ])
      } else { setHoldings(d) }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const totalValue = holdings.reduce((s, h) => s + (h.amount * (cryptoPrices[h.coin]?.price || 0)), 0)

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Wealth</h1><p className="text-[#8ea6b6] text-sm">Crypto · Gold · Smart Statements</p></div>

      <div className="bg-gradient-to-r from-purple-900/40 to-zinc-900 rounded-2xl p-6 border border-[#1e3d4d]">
        <p className="text-[#8ea6b6] text-sm">Portfolio Value</p>
        <p className="text-3xl font-bold text-white">₹{totalValue.toLocaleString("en-IN")}</p>
        <p className="text-[#2dd4bf] text-sm mt-1 flex items-center gap-1"><TrendingUp className="w-4 h-4" />+₹{(totalValue * 0.02).toLocaleString("en-IN")} today</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold">Crypto Holdings</h2>
        <button onClick={() => setShowBuy(!showBuy)} className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm">Buy Crypto</button>
      </div>

      {showBuy && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-3">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(cryptoPrices).map(([coin, data]) => (
              <button key={coin} onClick={() => setBuyCoin(coin)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${buyCoin === coin ? "bg-purple-500 text-white" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{coin} ₹{data.price.toLocaleString("en-IN")}</button>
            ))}
          </div>
          <input type="number" step="0.001" placeholder="Amount to spend (₹)" value={buyAmount} onChange={e => setBuyAmount(e.target.value)} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:outline-none focus:border-purple-500" />
          <button className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-lg py-2.5 text-sm font-medium">Buy {buyCoin}</button>
        </div>
      )}

      {loading ? (
        <div className="text-[#8ea6b6] text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-2">
          {holdings.map(h => {
            const cp = cryptoPrices[h.coin]
            const value = h.amount * (cp?.price || 0)
            const pnl = (cp?.price || 0) - h.avgPrice
            return (
              <div key={h.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0e2633] flex items-center justify-center text-sm font-bold text-white">{h.coin[0]}</div>
                  <div><p className="text-white font-medium">{h.coin}</p><p className="text-[#8ea6b6] text-xs">{h.amount} {h.coin}</p></div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">₹{value.toLocaleString("en-IN")}</p>
                  <p className={`text-xs ${pnl >= 0 ? "text-[#2dd4bf]" : "text-red-400"}`}>{pnl >= 0 ? "+" : ""}₹{pnl.toLocaleString("en-IN")}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
