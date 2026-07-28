"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Eye, EyeOff, Send, Plus, Download, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, MoreHorizontal, RefreshCw } from "lucide-react"

const accounts = [
  { name: "INR Account", balance: 1248500, currency: "INR", change: "+2.5%", upi: "rahul@revolut", type: "Primary" },
  { name: "USD Wallet", balance: 2500, currency: "USD", change: "+0.8%", upi: null, type: "Multi-Currency" },
  { name: "EUR Wallet", balance: 1200, currency: "EUR", change: "-1.2%", upi: null, type: "Multi-Currency" },
]

const quickActions = [
  { label: "Send", icon: Send, color: "bg-[#5046e5]/10 text-[#5046e5]" },
  { label: "Request", icon: ArrowDownRight, color: "bg-[#00b894]/10 text-[#00b894]" },
  { label: "Add", icon: Plus, color: "bg-[#00cec9]/10 text-[#00cec9]" },
  { label: "Cards", icon: Download, color: "bg-[#fd79a8]/10 text-[#fd79a8]" },
]

const transactions = [
  { id: "1", type: "DEBIT", amount: 2499, category: "Food", desc: "Swiggy Order", name: "Swiggy", time: new Date(Date.now() - 2 * 3600000), status: "Completed" },
  { id: "2", type: "CREDIT", amount: 85000, category: "Salary", desc: "Salary Credit - ABC Corp", name: "ABC Corp", time: new Date(Date.now() - 24 * 3600000), status: "Completed" },
  { id: "3", type: "DEBIT", amount: 15999, category: "Shopping", desc: "Amazon.in Purchase", name: "Amazon Pay", time: new Date(Date.now() - 48 * 3600000), status: "Completed" },
  { id: "4", type: "DEBIT", amount: 450, category: "Travel", desc: "Uber Ride - Office", name: "Uber", time: new Date(Date.now() - 72 * 3600000), status: "Completed" },
  { id: "5", type: "CREDIT", amount: 5000, category: "Refund", desc: "Flipkart Order Refund", name: "Flipkart", time: new Date(Date.now() - 96 * 3600000), status: "Completed" },
  { id: "6", type: "DEBIT", amount: 799, category: "Bills", desc: "Electricity Bill", name: "Tata Power", time: new Date(Date.now() - 120 * 3600000), status: "Completed" },
]

const spendingInsights = [
  { label: "Food & Dining", amount: 12250, budget: 15000, color: "#5046e5" },
  { label: "Shopping", amount: 8500, budget: 10000, color: "#fd79a8" },
  { label: "Transport", amount: 3200, budget: 8000, color: "#00cec9" },
  { label: "Bills", amount: 11000, budget: 12000, color: "#00b894" },
]

export default function DashboardPage() {
  const [showBalance, setShowBalance] = useState(true)
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Good morning, Rahul</h1>
          <p className="text-sm text-[#636e72]">Here&apos;s your financial summary</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="h-4 w-4 mr-1.5" /> Statement
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Add Money
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="gradient-card rounded-2xl p-5 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-white/70">Total Balance</p>
              <button onClick={() => setShowBalance(!showBalance)} className="text-white/70 hover:text-white transition-colors">
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight tabular-nums">
              {showBalance ? formatCurrency(totalBalance) : "••••••"}
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5 text-sm text-white/70">
              <TrendingUp className="h-4 w-4 text-[#00b894]" />
              <span className="text-[#00b894] font-medium">+2.5%</span>
              <span>vs last month</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {accounts.map((a) => (
                <div key={a.currency} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-xs text-white/60">{a.currency}</p>
                  <p className="font-semibold text-sm tabular-nums mt-0.5">
                    {showBalance ? formatCurrency(a.balance, a.currency) : "••••"}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${a.change.startsWith("+") ? "text-[#00b894]" : "text-[#fd79a8]"}`}>
                    {a.change}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Monthly Income", amount: 125000, change: "+8%", color: "text-[#00b894]", icon: TrendingUp },
            { label: "Monthly Spend", amount: 42500, change: "-3%", color: "text-[#fd79a8]", icon: TrendingDown },
            { label: "Savings Rate", amount: 66, change: "+5%", color: "text-[#5046e5]", suffix: "%", icon: TrendingUp },
            { label: "Rewards Earned", amount: 2340, change: "+18%", color: "text-[#00cec9]", icon: TrendingUp },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#636e72]">{stat.label}</span>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className="text-lg font-bold tabular-nums">
                    {stat.suffix ? `${stat.amount}${stat.suffix}` : formatCurrency(stat.amount)}
                  </p>
                  <p className={`text-xs font-medium ${stat.color}`}>{stat.change}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#e8eaed] dark:divide-[#2a2a45]">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f5f6fa] dark:hover:bg-[#1a1a30] transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === "CREDIT" ? "bg-[#00b894]/10" : "bg-[#d63031]/10"
                    }`}>
                      {tx.type === "CREDIT" ? (
                        <ArrowDownRight className="h-4 w-4 text-[#00b894]" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-[#d63031]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{tx.desc}</p>
                      <div className="flex items-center gap-1.5 text-xs text-[#636e72]">
                        <span className="truncate">{tx.category}</span>
                        <span>·</span>
                        <span>{formatDate(tx.time, "relative")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className={`text-sm font-semibold tabular-nums ${tx.type === "CREDIT" ? "text-[#00b894]" : ""}`}>
                      {tx.type === "CREDIT" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">{tx.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button key={action.label} className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] hover:bg-[#f5f6fa] dark:hover:bg-[#1a1a30] transition-colors">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${action.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium">{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spending This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {spendingInsights.map((s) => {
                const pct = Math.min((s.amount / s.budget) * 100, 100)
                return (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">{s.label}</span>
                      <span className="text-[#636e72]">{formatCurrency(s.amount)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#f5f6fa] dark:bg-[#1a1a30] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
