"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, RefreshCw, ArrowRight, Globe, DollarSign, Banknote } from "lucide-react"
import * as React from "react"

const rates = [
  { pair: "USD/INR", rate: 83.45, change: 0.12, direction: "up" as const },
  { pair: "EUR/INR", rate: 90.23, change: -0.08, direction: "down" as const },
  { pair: "GBP/INR", rate: 105.67, change: 0.05, direction: "up" as const },
  { pair: "AED/INR", rate: 22.71, change: -0.02, direction: "down" as const },
  { pair: "SGD/INR", rate: 61.89, change: 0.03, direction: "up" as const },
]

const wallets = [
  { currency: "USD", balance: 2500, value: 208625, flag: "🇺🇸" },
  { currency: "EUR", balance: 1200, value: 108276, flag: "🇪🇺" },
]

const currencyIcons: Record<string, string> = { USD: "💵", EUR: "💶", GBP: "💷", AED: "🇦🇪", SGD: "🇸🇬" }

export default function ForexPage() {
  const [fromCur, setFromCur] = React.useState("INR")
  const [toCur, setToCur] = React.useState("USD")

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Foreign Exchange</h1>
          <p className="text-sm text-[#636e72] mt-0.5">Zero-markup global transfers</p>
        </div>
        <Badge variant="success" className="gap-1.5 px-3 py-1.5">
          <RefreshCw className="h-3 w-3" /> Live Rates
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Exchange Rates</h2>
              <button className="text-xs text-[#5046e5] hover:underline">View all 30+ currencies</button>
            </div>
            <div className="space-y-1">
              {rates.map((r) => (
                <div key={r.pair} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f8f9fc] dark:hover:bg-[#1a1a30] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      r.direction === "up" ? "bg-[#00b894]/10" : "bg-[#d63031]/10"
                    }`}>
                      <span className="text-lg">{currencyIcons[r.pair.split("/")[0]] || "💱"}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{r.pair}</p>
                      <p className="text-xs text-[#00b894]">0% markup • Interbank</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{r.rate.toFixed(2)}</p>
                    <p className={`text-xs flex items-center gap-0.5 justify-end ${r.direction === "up" ? "text-[#00b894]" : "text-[#d63031]"}`}>
                      {r.direction === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {r.direction === "up" ? "+" : ""}{r.change}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm">
            <h2 className="font-semibold mb-4">Convert Currency</h2>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1.5 block">Amount</label>
                <input type="number" className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]" placeholder="0.00" />
              </div>
              <div className="w-28">
                <label className="text-sm font-medium mb-1.5 block">From</label>
                <div className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-[#f8f9fc] dark:bg-[#1a1a30] flex items-center text-sm text-[#636e72]">{fromCur}</div>
              </div>
              <div className="pb-2">
                <ArrowRight className="h-5 w-5 text-[#636e72]" />
              </div>
              <div className="w-28">
                <label className="text-sm font-medium mb-1.5 block">To</label>
                <input value={toCur} onChange={(e) => setToCur(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]" placeholder="USD" />
              </div>
              <Button className="h-11">Convert</Button>
            </div>
            <div className="mt-3 rounded-xl bg-[#00b894]/5 border border-[#00b894]/20 p-4 text-sm flex items-center gap-3">
              <Banknote className="h-5 w-5 text-[#00b894] shrink-0" />
              <div>
                <p className="font-medium text-[#00b894]">You save ₹0 in forex fees</p>
                <p className="text-xs text-[#636e72]">Banks charge 3-5% on this transaction</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm">
            <h2 className="font-semibold mb-4">Your Wallets</h2>
            <div className="space-y-3">
              {wallets.map((w) => (
                <div key={w.currency} className="p-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] hover:border-[#5046e5]/20 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{w.flag}</span>
                    <span className="text-sm font-medium">{w.currency} Wallet</span>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(w.balance, w.currency)}</p>
                  <p className="text-xs text-[#636e72]">≈ {formatCurrency(w.value)}</p>
                </div>
              ))}
              <Button variant="outline" className="w-full gap-1.5">
                <Globe className="h-4 w-4" /> Add Currency
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm">
            <h2 className="font-semibold text-sm mb-2">Why Revolut?</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#00b894] mt-0.5 shrink-0" />
                <span className="text-[#636e72] text-xs">Interbank exchange rates</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#00b894] mt-0.5 shrink-0" />
                <span className="text-[#636e72] text-xs">0% markup, no hidden fees</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#00b894] mt-0.5 shrink-0" />
                <span className="text-[#636e72] text-xs">Hold 30+ currencies</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
