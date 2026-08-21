"use client"
import { useState, useEffect } from "react"
import { Globe, IndianRupee, ArrowLeftRight } from "lucide-react"

export default function NREPage() {
  const [accounts, setAccounts] = useState<any[]>([]); const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/nre-accounts").then(r => r.json()).then(d => { setAccounts(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const sampleNre = [{ type: "NRE Savings", accountNumber: "IN70012345678901234567", ifsc: "NOVA0000001", balance: 1250000, repatriable: true }, { type: "NRO Savings", accountNumber: "IN70012345678909876543", ifsc: "NOVA0000001", balance: 350000, repatriable: false }]

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">NRE / NRO Accounts</h1><p className="text-[#8ea6b6] text-sm">NRI banking · Repatriable savings · FCNR linked</p></div>
      <div className="bg-gradient-to-r from-cyan-900/40 to-zinc-900 rounded-2xl p-6 border border-[#1e3d4d]">
        <Globe className="w-6 h-6 text-cyan-400 mb-2" />
        <p className="text-[#8ea6b6] text-sm">Total NRI Balance</p>
        <p className="text-3xl font-bold text-white">₹{(accounts.reduce((s, a) => s + a.balance, 0) || 1600000).toLocaleString("en-IN")}</p>
      </div>
      {(loading ? [] : accounts.length > 0 ? accounts : sampleNre).map((a: any, i: number) => (
        <div key={i} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d]">
          <div className="flex items-center justify-between mb-2"><span className="text-white font-medium">{a.type}</span><span className={`text-xs px-2 py-0.5 rounded-full ${a.repatriable !== false ? "bg-[#2dd4bf]/20 text-[#2dd4bf]" : "bg-yellow-900/50 text-yellow-400"}`}>{a.repatriable !== false ? "Repatriable" : "Non-Repatriable"}</span></div>
          <p className="text-[#8ea6b6] text-sm font-mono">{a.accountNumber}</p>
          <p className="text-[#8ea6b6] text-xs">IFSC: {a.ifsc}</p>
          <div className="flex items-center justify-between mt-2"><span className="text-white font-semibold text-lg">₹{a.balance?.toLocaleString("en-IN") || 0}</span>
            <div className="flex gap-2"><button className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-lg text-xs font-medium">Transfer</button><button className="bg-[#0e2633] text-[#8ea6b6] px-3 py-1 rounded-lg text-xs">Statement</button></div>
          </div>
        </div>
      ))}
    </div>
  )
}
