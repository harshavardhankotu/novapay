"use client"
import { useState, useEffect } from "react"
import { Banknote, Link, TrendingUp } from "lucide-react"

interface ExternalAccount { id: string; bank: string; accountNo: string; balance: number; lastSynced?: string }

export default function AAPage() {
  const [accounts, setAccounts] = useState<ExternalAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [totalBalance, setTotalBalance] = useState(0)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/external-accounts").then(r => r.json()).then(d => { setAccounts(d); setTotalBalance(d.reduce((s: number, a: ExternalAccount) => s + a.balance, 0)); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleLink = async () => {
    setError("")
    try {
      const simulatorBanks = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank"]
      const randomBank = simulatorBanks[Math.floor(Math.random() * simulatorBanks.length)]
      const res = await fetch("/api/external-accounts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bank: randomBank, accountNo: `XXXX${Math.floor(1000 + Math.random() * 9000)}`, balance: Math.floor(Math.random() * 500000 + 10000) }),
      })
      if (res.ok) { const acc = await res.json(); setAccounts(prev => [...prev, acc]); setTotalBalance(s => s + acc.balance) }
      else setError("Failed to link account")
    } catch { setError("Network error") }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Account Aggregator</h1><p className="text-[#8ea6b6] text-sm">RBI AA framework · View all bank accounts in one place</p></div>
        <button onClick={handleLink} className="bg-[#2dd4bf] hover:bg-[#14a390] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Link className="w-4 h-4" /> Link Account
        </button>
      </div>

      {error && <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-400 text-sm">{error}</div>}

      {loading ? (
        <div className="bg-[#0e2633] rounded-2xl p-8 border border-[#1e3d4d] text-center text-[#8ea6b6]">Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <div className="bg-[#0e2633] rounded-2xl p-8 border border-[#1e3d4d] text-center">
          <Banknote className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" />
          <p className="text-[#8ea6b6] font-medium">No accounts linked yet</p>
          <p className="text-[#8ea6b6] text-sm mt-1">Link via AA to view all bank accounts at a glance</p>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-emerald-900/40 to-zinc-900 rounded-2xl p-6 border border-[#1e3d4d]">
            <p className="text-[#8ea6b6] text-sm">Total Linked Balance</p>
            <p className="text-3xl font-bold text-white mt-1">₹{totalBalance.toLocaleString("en-IN")}</p>
            <div className="flex gap-4 mt-3 text-sm"><span className="text-[#8ea6b6]">{accounts.length} accounts</span><span className="text-[#2dd4bf] flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Auto-synced</span></div>
          </div>
          {accounts.map(a => (
            <div key={a.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] flex items-center justify-between hover:border-[#1e3d4d]">
              <div><p className="text-white font-medium">{a.bank}</p><p className="text-[#8ea6b6] text-sm">{a.accountNo}</p></div>
              <p className="text-white font-semibold">₹{a.balance.toLocaleString("en-IN")}</p>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
