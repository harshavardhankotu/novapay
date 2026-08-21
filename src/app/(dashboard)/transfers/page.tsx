"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, ArrowRight, User, Building2, Globe, Clock, Star, Search } from "lucide-react"
import * as React from "react"

type TxMethod = "neft" | "upi" | "international"

const beneficiaries = [
  { name: "Priya Sharma", type: "BANK", detail: "HDFC Bank ****4521", recent: true },
  { name: "Amit Singh", type: "UPI", detail: "amit@paytm", recent: true },
  { name: "Mumbai Office", type: "BANK", detail: "ICICI ****7890", recent: false },
  { name: "Mom & Dad", type: "UPI", detail: "family@novapay", recent: false },
]

export default function TransfersPage() {
  const [method, setMethod] = React.useState<TxMethod>("neft")
  const [amount, setAmount] = React.useState("")

  const methods = [
    { id: "neft" as const, label: "NEFT / IMPS", icon: Building2 },
    { id: "upi" as const, label: "UPI Transfer", icon: ArrowUpDown },
    { id: "international" as const, label: "International", icon: Globe },
  ]

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Transfers</h1>
        <p className="text-sm text-[#8ea6b6] mt-0.5">Send money instantly across India</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm">
            <div className="flex gap-1.5 bg-[#f3efe6] dark:bg-[#0e2633] rounded-xl p-1 mb-5">
              {methods.map((m) => {
                const Icon = m.icon
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      method === m.id
                        ? "bg-white dark:bg-[#071a26] shadow-sm text-white dark:text-white"
                        : "text-[#8ea6b6] hover:text-white dark:hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {m.label}
                  </button>
                )
              })}
            </div>

            <div className="space-y-4">
              {method === "neft" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Beneficiary</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8ea6b6]" />
                      <input className="w-full h-11 pl-9 pr-4 rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d] placeholder:text-[#8ea6b6]" placeholder="Search saved beneficiaries..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Account Number</label>
                      <input className="w-full h-11 px-4 rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d] placeholder:text-[#8ea6b6]" placeholder="Enter account number" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">IFSC Code</label>
                      <input className="w-full h-11 px-4 rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d] placeholder:text-[#8ea6b6]" placeholder="Enter IFSC" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Amount (INR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ea6b6] font-medium">₹</span>
                      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full h-11 pl-8 pr-4 rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d] placeholder:text-[#8ea6b6]" placeholder="0.00" />
                    </div>
                  </div>
                </>
              )}

              {method === "upi" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">UPI ID</label>
                    <input className="w-full h-11 px-4 rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d] placeholder:text-[#8ea6b6]" placeholder="example@upi" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Amount (INR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ea6b6] font-medium">₹</span>
                      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full h-11 pl-8 pr-4 rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d] placeholder:text-[#8ea6b6]" placeholder="0.00" />
                    </div>
                  </div>
                </>
              )}

              {method === "international" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Send Amount</label>
                    <input type="number" className="w-full h-11 px-4 rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d] placeholder:text-[#8ea6b6]" placeholder="0.00" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">From</label>
                      <div className="w-full h-11 px-4 rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] bg-[#f3efe6] dark:bg-[#0e2633] flex items-center text-sm text-[#8ea6b6]">INR</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">To</label>
                      <input className="w-full h-11 px-4 rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d] placeholder:text-[#8ea6b6]" placeholder="USD, EUR, GBP..." />
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#4ade80]/5 border border-[#4ade80]/20 p-4 text-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8ea6b6]">Exchange Rate</span>
                      <span className="font-medium">1 INR = 0.012 USD</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8ea6b6]">Markup</span>
                      <span className="text-[#4ade80] font-medium">0% • Interbank rate</span>
                    </div>
                  </div>
                </>
              )}

              <Button className="w-full" size="lg">
                {method === "international" ? "Continue" : "Send Money"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-3">Quick Beneficiaries</h3>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {beneficiaries.filter(b => b.recent).map((b) => (
                <button key={b.name} className="flex flex-col items-center gap-1.5 p-3 min-w-[80px] rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] hover:bg-[#f3efe6] dark:hover:bg-[#0e2633] transition-colors">
                  <div className="h-10 w-10 rounded-full bg-[#e8a33d]/10 flex items-center justify-center">
                    {b.type === "BANK" ? <Building2 className="h-4 w-4 text-[#e8a33d]" /> : <ArrowUpDown className="h-4 w-4 text-[#e8a33d]" />}
                  </div>
                  <span className="text-xs font-medium truncate w-full text-center">{b.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-[#fbbf24]" />
              <h3 className="font-semibold text-sm">All Beneficiaries</h3>
            </div>
            <div className="space-y-2">
              {beneficiaries.map((b) => (
                <div key={b.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f3efe6] dark:hover:bg-[#0e2633] cursor-pointer transition-colors">
                  <div className="h-9 w-9 rounded-full bg-[#e8a33d]/10 flex items-center justify-center shrink-0">
                    {b.type === "BANK" ? <Building2 className="h-4 w-4 text-[#e8a33d]" /> : <ArrowUpDown className="h-4 w-4 text-[#e8a33d]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{b.name}</p>
                    <p className="text-xs text-[#8ea6b6] truncate">{b.detail}</p>
                  </div>
                  {b.recent && <Clock className="h-3.5 w-3.5 text-[#8ea6b6] shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-2">Transfer Limits</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#8ea6b6]">NEFT</span><span>No limit</span></div>
              <div className="flex justify-between"><span className="text-[#8ea6b6]">IMPS</span><span>₹5L/day</span></div>
              <div className="flex justify-between"><span className="text-[#8ea6b6]">UPI</span><span>₹1L/day</span></div>
              <div className="flex justify-between"><span className="text-[#8ea6b6]">International</span><span>As per LRS</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
