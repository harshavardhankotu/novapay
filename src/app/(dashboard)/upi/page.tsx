"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { QrCode, Scan, Copy, Smartphone, ArrowRight, Check, Plus } from "lucide-react"
import * as React from "react"

const recentUpi = [
  { id: "1", name: "Amit Singh", handle: "amit@paytm", amount: 2500, date: "2h ago", type: "DEBIT" as const },
  { id: "2", name: "Priya Sharma", handle: "priya@revolut", amount: 500, date: "5h ago", type: "CREDIT" as const },
  { id: "3", name: "Rahul Verma", handle: "rahulv@ybl", amount: 15000, date: "Yesterday", type: "DEBIT" as const },
  { id: "4", name: "Swiggy", handle: "swiggy@paytm", amount: 449, date: "Yesterday", type: "DEBIT" as const },
]

export default function UpiPage() {
  const [upiId, setUpiId] = React.useState("")
  const [copiedHandle, setCopiedHandle] = React.useState<string | null>(null)

  const handleCopy = (handle: string) => {
    navigator.clipboard.writeText(handle)
    setCopiedHandle(handle)
    setTimeout(() => setCopiedHandle(null), 2000)
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold">UPI Payments</h1>
        <p className="text-sm text-[#636e72] mt-0.5">Pay anyone instantly with UPI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm">
            <h2 className="font-semibold mb-4">Pay via UPI</h2>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]"
                  placeholder="Enter UPI ID (e.g. name@upi)"
                />
              </div>
              <Button className="h-11 gap-1.5">
                Pay <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#e8eaed] dark:border-[#2a2a45]" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-[#15152a] px-2 text-[#636e72]">or</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center gap-2 p-5 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] hover:bg-[#f8f9fc] dark:hover:bg-[#1a1a30] transition-all hover:border-[#5046e5]/30">
                <div className="h-12 w-12 rounded-xl bg-[#5046e5]/10 flex items-center justify-center">
                  <Scan className="h-6 w-6 text-[#5046e5]" />
                </div>
                <span className="text-sm font-medium">Scan QR</span>
                <span className="text-xs text-[#636e72]">Pay by scanning</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-5 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] hover:bg-[#f8f9fc] dark:hover:bg-[#1a1a30] transition-all hover:border-[#5046e5]/30">
                <div className="h-12 w-12 rounded-xl bg-[#00b894]/10 flex items-center justify-center">
                  <QrCode className="h-6 w-6 text-[#00b894]" />
                </div>
                <span className="text-sm font-medium">My QR</span>
                <span className="text-xs text-[#636e72]">Receive payments</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm">
            <h2 className="font-semibold mb-4">Recent Transactions</h2>
            <div className="space-y-1">
              {recentUpi.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f8f9fc] dark:hover:bg-[#1a1a30] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      tx.type === "CREDIT" ? "bg-[#00b894]/10" : "bg-[#f8f9fc] dark:bg-[#1a1a30]"
                    }`}>
                      <Smartphone className="h-4 w-4" style={{ color: tx.type === "CREDIT" ? "#00b894" : "#636e72" }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.name}</p>
                      <p className="text-xs text-[#636e72]">{tx.handle} • {tx.date}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold ${tx.type === "CREDIT" ? "text-[#00b894]" : ""}`}>
                    {tx.type === "CREDIT" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm">
            <h2 className="font-semibold mb-4">Your UPI Handles</h2>
            <div className="space-y-3">
              {[
                { handle: "rahul@revolut", type: "Primary", verified: true },
                { handle: "rahul.kumar@oksbi", type: "Secondary", verified: true },
                { handle: "rahulk@paytm", type: "Additional", verified: false },
              ].map((u) => (
                <div key={u.handle} className="p-3.5 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] hover:border-[#5046e5]/20 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-mono font-medium">{u.handle}</p>
                    <button onClick={() => handleCopy(u.handle)} className="hover:opacity-70 transition-opacity">
                      {copiedHandle === u.handle ? (
                        <Check className="h-4 w-4 text-[#00b894]" />
                      ) : (
                        <Copy className="h-4 w-4 text-[#636e72]" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.type === "Primary" ? "default" : "secondary"} className="text-[10px]">{u.type}</Badge>
                    {u.verified && <Badge variant="success" className="text-[10px]">Verified</Badge>}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full gap-1.5" size="sm">
                <Plus className="h-4 w-4" /> Create New Handle
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm">
            <h2 className="font-semibold text-sm mb-2">UPI Limits</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-[#636e72]">Per Transaction</span><span className="font-medium">₹1,00,000</span></div>
              <div className="flex justify-between"><span className="text-[#636e72]">Daily Limit</span><span className="font-medium">₹1,00,000</span></div>
              <div className="flex justify-between"><span className="text-[#636e72]">Monthly</span><span className="font-medium">Unlimited</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
