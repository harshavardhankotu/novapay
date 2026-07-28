"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Plus, ArrowUpRight, ArrowDownRight, Copy } from "lucide-react"

const accounts = [
  { id: "1", name: "INR Savings", type: "SAVINGS", balance: 1248500, currency: "INR", accNo: "REVINR0001", ifsc: "REVU0000001", upi: "rahul@revolut", isActive: true },
  { id: "2", name: "USD Wallet", type: "CURRENT", balance: 2500, currency: "USD", accNo: "REVUSD0001", ifsc: "REVU0000001", upi: null, isActive: true },
  { id: "3", name: "EUR Wallet", type: "CURRENT", balance: 1200, currency: "EUR", accNo: "REVEUR0001", ifsc: "REVU0000001", upi: null, isActive: true },
]

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Open Account
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {accounts.map((acc) => (
          <Card key={acc.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-[#636e72]">{acc.name}</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(acc.balance, acc.currency)}</p>
                </div>
                <Badge variant={acc.isActive ? "success" : "secondary"}>{acc.isActive ? "Active" : "Inactive"}</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#636e72]">Account</span>
                  <span className="font-mono text-xs">{acc.accNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#636e72]">IFSC</span>
                  <span className="font-mono text-xs">{acc.ifsc}</span>
                </div>
                {acc.upi && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#636e72]">UPI Handle</span>
                    <span className="font-mono text-xs flex items-center gap-1">
                      {acc.upi}
                      <Copy className="h-3 w-3 text-[#636e72] cursor-pointer" />
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#dfe6e9] dark:border-[#2d3436]">
                <Button variant="outline" size="sm" className="flex-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" /> Send
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <ArrowDownRight className="h-4 w-4 mr-1" /> Receive
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
