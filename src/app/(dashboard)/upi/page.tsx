"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { QrCode, Scan, Copy, Smartphone, ArrowRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const recentUpi = [
  { id: "1", name: "Amit Singh", handle: "amit@paytm", amount: 2500, date: "2h ago", type: "DEBIT" },
  { id: "2", name: "Priya Sharma", handle: "priya@revolut", amount: 500, date: "5h ago", type: "CREDIT" },
  { id: "3", name: "Rahul Verma", handle: "rahulv@ybl", amount: 15000, date: "Yesterday", type: "DEBIT" },
  { id: "4", name: "Swiggy", handle: "swiggy@paytm", amount: 449, date: "Yesterday", type: "DEBIT" },
]

export default function UpiPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">UPI Payments</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pay via UPI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Enter UPI ID (e.g. name@upi)" className="flex-1" />
                <Button>Pay</Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#dfe6e9] dark:border-[#2d3436]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-[#1a1a2e] px-2 text-[#636e72]">or</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <Scan className="h-6 w-6" />
                  <span className="text-xs">Scan QR</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <QrCode className="h-6 w-6" />
                  <span className="text-xs">My QR</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>UPI Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {recentUpi.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f8f9fa] dark:hover:bg-[#2d3436]">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                        tx.type === "CREDIT" ? "bg-[#00b894]/10" : "bg-[#f8f9fa] dark:bg-[#2d3436]"
                      }`}>
                        <Smartphone className="h-4 w-4" />
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
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your UPI Handles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { handle: "rahul@revolut", type: "Primary", verified: true },
              { handle: "rahul.kumar@oksbi", type: "Secondary", verified: true },
              { handle: "rahulk@paytm", type: "Additional", verified: false },
            ].map((u) => (
              <div key={u.handle} className="p-3 rounded-lg border border-[#dfe6e9] dark:border-[#2d3436]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-mono">{u.handle}</p>
                    <Badge variant="secondary" className="text-[10px] mt-1">{u.type}</Badge>
                  </div>
                  <Copy className="h-4 w-4 text-[#636e72] cursor-pointer" />
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" size="sm">Create New Handle</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
