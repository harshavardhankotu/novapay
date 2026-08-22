"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useUserStore } from "@/store/user-store"
import { Eye, EyeOff, Send, Plus, Download, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Sparkles, Waves } from "lucide-react"
import { HealthScoreWidget } from "@/components/dashboard/health-widget"

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
    { label: "Send", icon: Send, color: "from-[#e8a33d]/20 to-[#e8a33d]/5 text-[#f2bd68]", href: "/transfers" },
    { label: "Cards", icon: Download, color: "from-[#4ade80]/20 to-[#4ade80]/5 text-[#4ade80]", href: "/cards" },
    { label: "UPI", icon: Plus, color: "from-[#2dd4bf]/20 to-[#2dd4bf]/5 text-[#2dd4bf]", href: "/upi" },
    { label: "Rewards", icon: Sparkles, color: "from-[#ff8a70]/20 to-[#ff8a70]/5 text-[#ff8a70]", href: "/rewards" },
  ]

  const spendingCategories = [
    { label: "Food & Dining", amount: monthlySpend * 0.35, budget: 15000, color: "#e8a33d" },
    { label: "Shopping", amount: monthlySpend * 0.25, budget: 10000, color: "#ff8a70" },
    { label: "Transport", amount: monthlySpend * 0.12, budget: 8000, color: "#2dd4bf" },
    { label: "Bills", amount: monthlySpend * 0.28, budget: 12000, color: "#4ade80" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-sm text-[#8ea6b6]">Here&apos;s your financial universe</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex border-[#1e3d4d] text-[#8ea6b6] hover:text-white hover:bg-[#0e2633]">
            <Download className="h-4 w-4 mr-1.5" /> Statement
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] hover:from-[#d18a24] hover:to-[#e0a64a] text-white border-0 shadow-lg shadow-[#e8a33d]/20" onClick={() => router.push("/transfers")}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Money
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <HealthScoreWidget />
          <div className="rounded-2xl p-5 sm:p-6 text-white bg-gradient-to-br from-[#062c3a] via-[#0a3a4d] to-[#071a26] border border-[#e8a33d]/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(232,163,61,0.12)_0%,transparent_60%)]" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-white/60">Total Balance</p>
                <button onClick={() => setShowBalance(!showBalance)} className="text-white/50 hover:text-white transition-colors">
                  {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight tabular-nums">
                {showBalance ? formatCurrency(totalBalance || 0) : "••••••"}
              </h2>
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-white/60">
                <TrendingUp className="h-4 w-4 text-[#4ade80]" />
                <span className="text-[#4ade80] font-medium">+2.5%</span>
                <span>vs last month</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-5">
                {accounts.length > 0 ? accounts.slice(0, 3).map((a) => (
                  <div key={a.currency} className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
                    <p className="text-xs text-white/50">{a.currency}</p>
                    <p className="font-semibold text-sm tabular-nums mt-0.5">
                      {showBalance ? formatCurrency(a.balance, a.currency) : "••••"}
                    </p>
                  </div>
                )) : (
                  <>
                    <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5"><p className="text-xs text-white/50">INR</p><p className="font-semibold text-sm mt-0.5">₹0.00</p></div>
                    <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5"><p className="text-xs text-white/50">USD</p><p className="font-semibold text-sm mt-0.5">$0.00</p></div>
                    <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5"><p className="text-xs text-white/50">EUR</p><p className="font-semibold text-sm mt-0.5">€0.00</p></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Monthly Income", amount: monthlyIncome || 85000, change: "+8%", color: "text-[#4ade80]", icon: TrendingUp },
            { label: "Monthly Spend", amount: monthlySpend || 42500, change: "-3%", color: "text-[#ff8a70]", icon: TrendingDown },
            { label: "Savings Rate", amount: monthlyIncome ? Math.round(((monthlyIncome - monthlySpend) / monthlyIncome) * 100) : 66, change: "+5%", color: "text-[#f2bd68]", suffix: "%", icon: TrendingUp },
            { label: "Transactions", amount: transactions.length, change: "+18%", color: "text-[#2dd4bf]", icon: TrendingUp },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-[#0e2633] rounded-xl p-4 border border-[#1e3d4d]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#8ea6b6]">{stat.label}</span>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-lg font-bold text-white tabular-nums">
                  {stat.suffix ? `${stat.amount}${stat.suffix}` : formatCurrency(typeof stat.amount === "number" ? stat.amount : 0)}
                </p>
                <p className={`text-xs font-medium ${stat.color}`}>{stat.change}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-[#0e2633] rounded-2xl border border-[#1e3d4d]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e3d4d]">
            <h3 className="font-semibold text-white text-sm">Recent Transactions</h3>
            <Button variant="ghost" size="sm" className="text-[#f2bd68] hover:text-[#f6cf8f] hover:bg-[#0e2633]" onClick={() => router.push("/accounts")}>View All</Button>
          </div>
          {transactions.length > 0 ? (
            <div className="divide-y divide-[#1e3d4d]">
              {transactions.slice(0, 6).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#0e2633] transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === "CREDIT" ? "bg-[#4ade80]/10" : "bg-[#f87171]/10"
                    }`}>
                      {tx.type === "CREDIT" ? (
                        <ArrowDownRight className="h-4 w-4 text-[#4ade80]" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-[#f87171]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                      <div className="flex items-center gap-1.5 text-xs text-[#8ea6b6]">
                        <span className="truncate">{tx.category}</span>
                        <span>·</span>
                        <span>{formatDate(tx.timestamp, "relative")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className={`text-sm font-semibold tabular-nums ${tx.type === "CREDIT" ? "text-[#4ade80]" : "text-white"}`}>
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
            <div className="text-center py-12 text-sm text-[#8ea6b6]">
              <Waves className="h-8 w-8 mx-auto mb-2 text-[#8ea6b6]" />
              No transactions yet. Send your first transfer!
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d]">
            <div className="px-5 py-4 border-b border-[#1e3d4d]">
              <h3 className="font-semibold text-white text-sm">Quick Actions</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button key={action.label} onClick={() => router.push(action.href)} className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-[#1e3d4d] bg-[#0e2633]/50 hover:bg-[#0e2633] hover:border-[#e8a33d]/20 transition-all card-hover">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-white">{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d]">
            <div className="px-5 py-4 border-b border-[#1e3d4d]">
              <h3 className="font-semibold text-white text-sm">Spending This Month</h3>
            </div>
            <div className="p-4 space-y-3">
              {spendingCategories.map((s) => {
                const pct = Math.min((s.amount / s.budget) * 100, 100)
                return (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-white">{s.label}</span>
                      <span className="text-[#8ea6b6]">{formatCurrency(Math.round(s.amount))}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#1e3d4d] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                )
              })}
              <Button variant="ghost" size="sm" className="w-full mt-1 text-xs text-[#f2bd68] hover:text-[#f6cf8f] hover:bg-[#0e2633]" onClick={() => router.push("/budgeting")}>
                View detailed budget
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
