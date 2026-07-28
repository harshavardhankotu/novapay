"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useUserStore } from "@/store/user-store"
import { Eye, EyeOff, Send, Plus, Download, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const { user, accounts, transactions, setTransactions } = useUserStore()
  const router = useRouter()
  const [showBalance, setShowBalance] = useState(true)

  useEffect(() => {
    fetch("/api/transactions?limit=6")
      .then((r) => r.json())
      .then((data) => {
        if (data.transactions) setTransactions(data.transactions)
      })
      .catch(() => {})
  }, [])

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)
  const monthTxns = transactions.filter((t) => {
    const txDate = new Date(t.timestamp)
    const now = new Date()
    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
  })
  const monthlySpend = monthTxns.filter((t) => t.type === "DEBIT").reduce((s, t) => s + t.amount, 0)
  const monthlyIncome = monthTxns.filter((t) => t.type === "CREDIT").reduce((s, t) => s + t.amount, 0)

  const quickActions = [
    { label: "Send", icon: Send, color: "bg-[#5046e5]/10 text-[#5046e5]", href: "/transfers" },
    { label: "Cards", icon: Download, color: "bg-[#00b894]/10 text-[#00b894]", href: "/cards" },
    { label: "UPI", icon: Plus, color: "bg-[#00cec9]/10 text-[#00cec9]", href: "/upi" },
    { label: "Rewards", icon: TrendingUp, color: "bg-[#fd79a8]/10 text-[#fd79a8]", href: "/rewards" },
  ]

  const spendingCategories = [
    { label: "Food & Dining", amount: monthlySpend * 0.35, budget: 15000, color: "#5046e5" },
    { label: "Shopping", amount: monthlySpend * 0.25, budget: 10000, color: "#fd79a8" },
    { label: "Transport", amount: monthlySpend * 0.12, budget: 8000, color: "#00cec9" },
    { label: "Bills", amount: monthlySpend * 0.28, budget: 12000, color: "#00b894" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user?.name?.split(" ")[0] || "User"}</h1>
          <p className="text-sm text-[#636e72]">Here&apos;s your financial summary</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="h-4 w-4 mr-1.5" /> Statement
          </Button>
          <Button size="sm" onClick={() => router.push("/transfers")}>
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
              {showBalance ? formatCurrency(totalBalance || 0) : "••••••"}
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5 text-sm text-white/70">
              <TrendingUp className="h-4 w-4 text-[#00b894]" />
              <span className="text-[#00b894] font-medium">+2.5%</span>
              <span>vs last month</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {accounts.length > 0 ? accounts.slice(0, 3).map((a) => (
                <div key={a.currency} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-xs text-white/60">{a.currency}</p>
                  <p className="font-semibold text-sm tabular-nums mt-0.5">
                    {showBalance ? formatCurrency(a.balance, a.currency) : "••••"}
                  </p>
                </div>
              )) : (
                <>
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm"><p className="text-xs text-white/60">INR</p><p className="font-semibold text-sm mt-0.5">₹0.00</p></div>
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm"><p className="text-xs text-white/60">USD</p><p className="font-semibold text-sm mt-0.5">$0.00</p></div>
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm"><p className="text-xs text-white/60">EUR</p><p className="font-semibold text-sm mt-0.5">€0.00</p></div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Monthly Income", amount: monthlyIncome || 85000, change: "+8%", color: "text-[#00b894]", icon: TrendingUp },
            { label: "Monthly Spend", amount: monthlySpend || 42500, change: "-3%", color: "text-[#fd79a8]", icon: TrendingDown },
            { label: "Savings Rate", amount: monthlyIncome ? Math.round(((monthlyIncome - monthlySpend) / monthlyIncome) * 100) : 66, change: "+5%", color: "text-[#5046e5]", suffix: "%", icon: TrendingUp },
            { label: "Transactions", amount: transactions.length, change: "+18%", color: "text-[#00cec9]", icon: TrendingUp },
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
                    {stat.suffix ? `${stat.amount}${stat.suffix}` : formatCurrency(typeof stat.amount === "number" ? stat.amount : 0)}
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
            <Button variant="ghost" size="sm" onClick={() => router.push("/accounts")}>View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length > 0 ? (
              <div className="divide-y divide-[#e8eaed] dark:divide-[#2a2a45]">
                {transactions.slice(0, 6).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f5f6fa] dark:hover:bg-[#1a1a30] transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === "CREDIT" ? "bg-[#00b894]/10" : "bg-[#e17055]/10"
                      }`}>
                        {tx.type === "CREDIT" ? (
                          <ArrowDownRight className="h-4 w-4 text-[#00b894]" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-[#e17055]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{tx.description}</p>
                        <div className="flex items-center gap-1.5 text-xs text-[#636e72]">
                          <span className="truncate">{tx.category}</span>
                          <span>·</span>
                          <span>{formatDate(tx.timestamp, "relative")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className={`text-sm font-semibold tabular-nums ${tx.type === "CREDIT" ? "text-[#00b894]" : ""}`}>
                        {tx.type === "CREDIT" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </p>
                      <Badge variant={tx.status === "COMPLETED" ? "success" : tx.status === "PENDING" ? "warning" : "destructive"} className="text-[10px] px-1.5 py-0">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-sm text-[#636e72]">No transactions yet. Make your first transfer!</div>
            )}
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
                    <button key={action.label} onClick={() => router.push(action.href)} className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] hover:bg-[#f5f6fa] dark:hover:bg-[#1a1a30] transition-colors">
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
              {spendingCategories.map((s) => {
                const pct = Math.min((s.amount / s.budget) * 100, 100)
                return (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">{s.label}</span>
                      <span className="text-[#636e72]">{formatCurrency(Math.round(s.amount))}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#f5f6fa] dark:bg-[#1a1a30] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                )
              })}
              <Button variant="ghost" size="sm" className="w-full mt-1 text-xs" onClick={() => router.push("/budgeting")}>
                View detailed budget
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
