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
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[#636e72] hover:text-[#1a1a2e] dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Transfers
      </button>

      <div>
        <h1 className="text-2xl font-bold">International Transfer</h1>
        <p className="text-sm text-[#636e72] mt-0.5">Send money abroad with zero markup</p>
      </div>

      <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">You Send</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#636e72] font-medium">₹</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full h-11 pl-8 pr-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5]" placeholder="0.00" />
            </div>
            <div className="w-20 h-11 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] flex items-center justify-center text-sm font-medium bg-[#f8f9fc] dark:bg-[#1a1a30]">INR</div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="h-8 w-8 rounded-full bg-[#5046e5]/10 flex items-center justify-center">
            <ArrowRight className="h-4 w-4 text-[#5046e5]" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Recipient Gets</label>
          <div className="flex gap-2">
            <div className="flex-1 h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] flex items-center text-sm font-medium bg-[#f8f9fc] dark:bg-[#1a1a30]">
              {convertedAmount > 0 ? `${selected?.flag || ""} ${convertedAmount.toFixed(2)}` : "0.00"}
            </div>
            <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="w-24 h-11 px-3 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-white dark:bg-[#15152a] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30">
              {currencies.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
          </div>
        </div>

        <div className="rounded-xl bg-[#00b894]/5 border border-[#00b894]/20 p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[#636e72]">Exchange Rate</span><span className="font-medium">1 INR = {(1 / (selected?.rate || 1)).toFixed(4)} {toCurrency}</span></div>
          <div className="flex justify-between"><span className="text-[#636e72]">Markup</span><span className="text-[#00b894] font-medium">0% • Interbank</span></div>
          <div className="flex justify-between"><span className="text-[#636e72]">Delivery</span><span className="font-medium">1-2 business days</span></div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Recipient Details</h2>
        <div className="space-y-3">
          <div><label className="text-sm font-medium mb-1.5 block">Full Name</label><input className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5]" placeholder="As on bank account" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Account Number / IBAN</label><input className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5]" placeholder="Enter account number" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">{toCurrency === "USD" ? "Routing Number" : toCurrency === "EUR" ? "BIC/SWIFT" : "Sort Code"}</label><input className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5]" placeholder="Enter code" /></div>
        </div>
      </div>

      <div className="rounded-xl bg-[#f8f9fc] dark:bg-[#1a1a30] p-4 flex items-start gap-3 text-sm">
        <Banknote className="h-5 w-5 text-[#00b894] shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">You save compared to banks</p>
          <p className="text-xs text-[#636e72]">Indian banks charge 3-5% on international transfers. You pay 0%.</p>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-[#e17055]/5 border border-[#e17055]/20 text-sm text-[#e17055]"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

      <Button className="w-full" size="lg" onClick={handleSubmit} disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</> : `Send ${convertedAmount > 0 ? `${convertedAmount.toFixed(2)} ${toCurrency}` : "International Transfer"}`}
        {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  )
}
