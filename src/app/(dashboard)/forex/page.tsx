"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { ArrowRight, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"

const rates = [
  { pair: "USD/INR", rate: 83.45, change: 0.12, direction: "up" },
  { pair: "EUR/INR", rate: 90.23, change: -0.08, direction: "down" },
  { pair: "GBP/INR", rate: 105.67, change: 0.05, direction: "up" },
  { pair: "AED/INR", rate: 22.71, change: -0.02, direction: "down" },
  { pair: "SGD/INR", rate: 61.89, change: 0.03, direction: "up" },
]

const wallets = [
  { currency: "USD", balance: 2500, value: 208625 },
  { currency: "EUR", balance: 1200, value: 108276 },
]

export default function ForexPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Foreign Exchange</h1>
        <Badge variant="success" className="gap-1">
          <RefreshCw className="h-3 w-3" /> Live Rates
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Exchange Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rates.map((r) => (
                <div key={r.pair} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f8f9fa] dark:hover:bg-[#2d3436]">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                      r.direction === "up" ? "bg-[#00b894]/10" : "bg-[#d63031]/10"
                    }`}>
                      {r.direction === "up" ? (
                        <TrendingUp className="h-4 w-4 text-[#00b894]" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-[#d63031]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{r.pair}</p>
                      <p className="text-xs text-[#00b894]">0% markup</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{r.rate}</p>
                    <p className={`text-xs ${r.direction === "up" ? "text-[#00b894]" : "text-[#d63031]"}`}>
                      {r.direction === "up" ? "+" : ""}{r.change}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Wallets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {wallets.map((w) => (
              <div key={w.currency} className="p-4 rounded-lg border border-[#dfe6e9] dark:border-[#2d3436]">
                <p className="text-sm text-[#636e72]">{w.currency} Wallet</p>
                <p className="text-xl font-bold">{formatCurrency(w.balance, w.currency)}</p>
                <p className="text-xs text-[#636e72]">≈ {formatCurrency(w.value)}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">Convert Currency</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Convert Currency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Amount</label>
              <Input type="number" placeholder="0.00" />
            </div>
            <div className="w-32">
              <label className="text-sm font-medium mb-1 block">From</label>
              <Input value="INR" disabled />
            </div>
            <div className="pb-2">
              <ArrowRight className="h-5 w-5 text-[#636e72]" />
            </div>
            <div className="w-32">
              <label className="text-sm font-medium mb-1 block">To</label>
              <Input placeholder="USD" />
            </div>
            <Button>Convert</Button>
          </div>
          <div className="mt-3 p-3 rounded-lg bg-[#f8f9fa] dark:bg-[#2d3436] text-sm">
            <p className="text-[#00b894] font-medium">You save ₹0 in forex fees</p>
            <p className="text-xs text-[#636e72]">Banks charge 3-5% on this transaction</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
