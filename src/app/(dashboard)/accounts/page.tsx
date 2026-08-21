"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import * as React from "react"
import { Plus, ArrowUpRight, ArrowDownRight, Copy, Building2, Wallet, PiggyBank, type LucideIcon } from "lucide-react"

const accounts = [
  { id: "1", name: "INR Savings", type: "SAVINGS", balance: 1248500, currency: "INR", accNo: "NOVAINR0001", ifsc: "NOVA0000001", upi: "rahul@novapay", isActive: true, color: "#e8a33d" },
  { id: "2", name: "USD Wallet", type: "CURRENT", balance: 2500, currency: "USD", accNo: "NOVAUSD0001", ifsc: "NOVA0000001", upi: null, isActive: true, color: "#2dd4bf" },
  { id: "3", name: "EUR Wallet", type: "CURRENT", balance: 1200, currency: "EUR", accNo: "NOVAEUR0001", ifsc: "NOVA0000001", upi: null, isActive: true, color: "#fbbf24" },
]

const typeIcons: Record<string, LucideIcon> = { SAVINGS: PiggyBank, CURRENT: Wallet }

export default function AccountsPage() {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-sm text-[#8ea6b6] mt-0.5">Manage your accounts and wallets</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Open Account
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {accounts.map((acc) => {
          const TypeIcon = typeIcons[acc.type]
          return (
            <div key={acc.id} className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-6 shadow-sm hover:shadow-md transition-all animate-slide-up group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${acc.color}15` }}>
                    <TypeIcon className="h-5 w-5" style={{ color: acc.color }} />
                  </div>
                  <div>
                    <p className="font-semibold">{acc.name}</p>
                    <p className="text-xs text-[#8ea6b6]">{acc.type} Account</p>
                  </div>
                </div>
                <Badge variant={acc.isActive ? "success" : "secondary"}>{acc.isActive ? "Active" : "Inactive"}</Badge>
              </div>

              <p className="text-3xl font-bold tracking-tight mb-4">{formatCurrency(acc.balance, acc.currency)}</p>

              <div className="space-y-2.5 text-sm bg-[#f3efe6] dark:bg-[#0e2633] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#8ea6b6]">Account No.</span>
                  <span className="font-mono text-xs flex items-center gap-1.5">
                    {acc.accNo}
                    <button onClick={() => handleCopy(`acc-${acc.id}`, acc.accNo)} className="hover:opacity-70 transition-opacity">
                      <Copy className={`h-3.5 w-3.5 ${copiedId === `acc-${acc.id}` ? "text-[#4ade80]" : "text-[#8ea6b6]"}`} />
                    </button>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8ea6b6]">IFSC</span>
                  <span className="font-mono text-xs">{acc.ifsc}</span>
                </div>
                {acc.upi && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8ea6b6]">UPI</span>
                    <span className="font-mono text-xs flex items-center gap-1.5">
                      {acc.upi}
                      <button onClick={() => handleCopy(`upi-${acc.id}`, acc.upi!)} className="hover:opacity-70 transition-opacity">
                        <Copy className={`h-3.5 w-3.5 ${copiedId === `upi-${acc.id}` ? "text-[#4ade80]" : "text-[#8ea6b6]"}`} />
                      </button>
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#f3efe6] dark:border-[#1e3d4d]">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                  <ArrowUpRight className="h-3.5 w-3.5" /> Send
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                  <ArrowDownRight className="h-3.5 w-3.5" /> Receive
                </Button>
                <Button variant="ghost" size="sm" className="px-2">
                  <Building2 className="h-4 w-4 text-[#8ea6b6]" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
