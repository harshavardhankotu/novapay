"use client"
import { useState, useEffect } from "react"
import { Banknote, Globe } from "lucide-react"

export default function ReceivingPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [swiftOpen, setSwiftOpen] = useState(false)
  const [currency, setCurrency] = useState("USD")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/receiving-accounts").then(r => r.json()).then(d => { setAccounts(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const generateSwift = () => {
    const banks: Record<string, { code: string; name: string }> = {
      USD: { code: "CHASUS33", name: "JPMorgan Chase New York" },
      GBP: { code: "BARCGB22", name: "Barclays London" },
      EUR: { code: "DEUTDEFF", name: "Deutsche Bank Frankfurt" },
      SGD: { code: "DBSGSGSG", name: "DBS Singapore" },
      AED: { code: "EBILAEAD", name: "Emirates NBD Dubai" },
    }
    const b = banks[currency] || banks.USD
    setAccounts(prev => [...prev, { id: `acct_${Date.now()}`, currency, accountNo: `IBAN IN${Math.floor(1e10 + Math.random() * 9e10)}`, swiftCode: b.code, bankName: b.name }])
    setSwiftOpen(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">International Receiving</h1><p className="text-[#8ea6b6] text-sm">Receive funds from 35+ countries via SWIFT/SEPA</p></div>
        <button onClick={() => setSwiftOpen(true)} className="bg-[#2dd4bf] hover:bg-[#14a390] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Globe className="w-4 h-4" /> New Account
        </button>
      </div>

      {swiftOpen && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-4">
          <h3 className="text-white font-semibold">Open Receiving Account</h3>
          <div className="flex gap-2 flex-wrap">
            {["USD", "GBP", "EUR", "SGD", "AED"].map(c => (
              <button key={c} onClick={() => setCurrency(c)} className={`px-4 py-2 rounded-lg text-sm font-medium ${currency === c ? "bg-[#2dd4bf] text-white" : "bg-[#0e2633] text-[#8ea6b6] hover:bg-[#0e2633]"}`}>{c}</button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={generateSwift} className="bg-[#2dd4bf] text-white px-6 py-2 rounded-lg text-sm font-medium">Generate Account</button>
            <button onClick={() => setSwiftOpen(false)} className="text-[#8ea6b6] text-sm hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-[#0e2633] rounded-2xl p-8 text-center text-[#8ea6b6] border border-[#1e3d4d]">Loading...</div>
      ) : accounts.length === 0 ? (
        <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]">
          <Banknote className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" />
          <p className="text-[#8ea6b6]">No receiving accounts yet</p>
          <p className="text-[#8ea6b6] text-sm mt-1">Open accounts in USD, GBP, EUR, SGD, AED and more</p>
        </div>
      ) : (
        accounts.map(a => (
          <div key={a.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] hover:border-[#1e3d4d]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">{a.currency} Account</span>
              <span className="bg-[#0e2633] text-[#f3efe6] text-xs px-2 py-0.5 rounded-full">{a.currency}</span>
            </div>
            <p className="text-[#8ea6b6] text-sm font-mono">{a.accountNo}</p>
            <p className="text-[#8ea6b6] text-xs mt-1">SWIFT: {a.swiftCode} · {a.bankName}</p>
          </div>
        ))
      )}
    </div>
  )
}
