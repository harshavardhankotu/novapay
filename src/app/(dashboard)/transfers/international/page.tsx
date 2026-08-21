"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Globe, ArrowRight, Banknote, AlertCircle, Loader2 } from "lucide-react"

const currencies = [
  { code: "USD", name: "US Dollar", rate: 83.45, flag: "🇺🇸" },
  { code: "EUR", name: "Euro", rate: 90.23, flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", rate: 105.67, flag: "🇬🇧" },
  { code: "AED", name: "Dirham", rate: 22.71, flag: "🇦🇪" },
  { code: "SGD", name: "Singapore Dollar", rate: 61.89, flag: "🇸🇬" },
]

export default function InternationalTransferPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [toCurrency, setToCurrency] = useState("USD")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const selected = currencies.find((c) => c.code === toCurrency)
  const convertedAmount = amount ? parseFloat(amount) * (selected?.rate || 1) : 0

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) { setError("Enter a valid amount"); return }
    setLoading(true)
    setError("")
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-lg">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[#8ea6b6] hover:text-white dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Transfers
      </button>

      <div>
        <h1 className="text-2xl font-bold">International Transfer</h1>
        <p className="text-sm text-[#8ea6b6] mt-0.5">Send money abroad with zero markup</p>
      </div>

      <div className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">You Send</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ea6b6] font-medium">₹</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full h-11 pl-8 pr-4 rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d]" placeholder="0.00" />
            </div>
            <div className="w-20 h-11 rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] flex items-center justify-center text-sm font-medium bg-[#f3efe6] dark:bg-[#0e2633]">INR</div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="h-8 w-8 rounded-full bg-[#e8a33d]/10 flex items-center justify-center">
            <ArrowRight className="h-4 w-4 text-[#e8a33d]" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Recipient Gets</label>
          <div className="flex gap-2">
            <div className="flex-1 h-11 px-4 rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] flex items-center text-sm font-medium bg-[#f3efe6] dark:bg-[#0e2633]">
              {convertedAmount > 0 ? `${selected?.flag || ""} ${convertedAmount.toFixed(2)}` : "0.00"}
            </div>
            <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="w-24 h-11 px-3 rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] bg-white dark:bg-[#0e2633] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30">
              {currencies.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
          </div>
        </div>

        <div className="rounded-xl bg-[#4ade80]/5 border border-[#4ade80]/20 p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[#8ea6b6]">Exchange Rate</span><span className="font-medium">1 INR = {(1 / (selected?.rate || 1)).toFixed(4)} {toCurrency}</span></div>
          <div className="flex justify-between"><span className="text-[#8ea6b6]">Markup</span><span className="text-[#4ade80] font-medium">0% • Interbank</span></div>
          <div className="flex justify-between"><span className="text-[#8ea6b6]">Delivery</span><span className="font-medium">1-2 business days</span></div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Recipient Details</h2>
        <div className="space-y-3">
          <div><label className="text-sm font-medium mb-1.5 block">Full Name</label><input className="w-full h-11 px-4 rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d]" placeholder="As on bank account" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Account Number / IBAN</label><input className="w-full h-11 px-4 rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d]" placeholder="Enter account number" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">{toCurrency === "USD" ? "Routing Number" : toCurrency === "EUR" ? "BIC/SWIFT" : "Sort Code"}</label><input className="w-full h-11 px-4 rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d]" placeholder="Enter code" /></div>
        </div>
      </div>

      <div className="rounded-xl bg-[#f3efe6] dark:bg-[#0e2633] p-4 flex items-start gap-3 text-sm">
        <Banknote className="h-5 w-5 text-[#4ade80] shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">You save compared to banks</p>
          <p className="text-xs text-[#8ea6b6]">Indian banks charge 3-5% on international transfers. You pay 0%.</p>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-[#ff8a70]/5 border border-[#ff8a70]/20 text-sm text-[#ff8a70]"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

      <Button className="w-full" size="lg" onClick={handleSubmit} disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</> : `Send ${convertedAmount > 0 ? `${convertedAmount.toFixed(2)} ${toCurrency}` : "International Transfer"}`}
        {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  )
}
