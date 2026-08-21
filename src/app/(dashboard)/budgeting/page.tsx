"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Plus, PiggyBank, Target, AlertTriangle, Lightbulb, UtensilsCrossed } from "lucide-react"

const budgets = [
  { category: "Food & Dining", amount: 15000, spent: 12250, color: "#e8a33d", icon: UtensilsCrossed },
  { category: "Shopping", amount: 10000, spent: 8500, color: "#ff8a70", icon: TrendingUp },
  { category: "Transportation", amount: 8000, spent: 3200, color: "#2dd4bf", icon: TrendingUp },
  { category: "Entertainment", amount: 5000, spent: 4800, color: "#fbbf24", icon: TrendingUp },
  { category: "Bills & Utilities", amount: 12000, spent: 11000, color: "#e8a33d", icon: TrendingUp },
]

const insights = [
  { title: "Spent ₹2,449 on Swiggy this month", desc: "That's 15% more than last month", type: "warning" as const, icon: AlertTriangle },
  { title: "You saved ₹5,000 this month", desc: "Great job! Increase your savings goal?", type: "success" as const, icon: Lightbulb },
  { title: "Entertainment budget at 96%", desc: "Only ₹200 remaining until reset", type: "danger" as const, icon: AlertTriangle },
]

export default function BudgetingPage() {
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const remaining = totalBudget - totalSpent

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budgeting</h1>
          <p className="text-sm text-[#8ea6b6] mt-0.5">Track spending with AI-powered insights</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Budget
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#e8a33d]/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-[#e8a33d]" />
            </div>
            <div>
              <p className="text-xs text-[#8ea6b6]">Total Budget</p>
              <p className="text-xl font-bold">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#ff8a70]/10 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-[#ff8a70]" />
            </div>
            <div>
              <p className="text-xs text-[#8ea6b6]">Total Spent</p>
              <p className="text-xl font-bold">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#4ade80]/10 flex items-center justify-center">
              <PiggyBank className="h-6 w-6 text-[#4ade80]" />
            </div>
            <div>
              <p className="text-xs text-[#8ea6b6]">Remaining</p>
              <p className="text-xl font-bold">{formatCurrency(remaining)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Budget Breakdown</h2>
          <div className="space-y-4">
            {budgets.map((b) => {
              const pct = (b.spent / b.amount) * 100
              const Icon = b.icon
              return (
                <div key={b.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${b.color}15` }}>
                        <Icon className="h-3 w-3" style={{ color: b.color }} />
                      </div>
                      <span className="text-sm font-medium">{b.category}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#f3efe6] dark:bg-[#1e3d4d] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: b.color }} />
                  </div>
                  <div className="flex justify-between text-xs text-[#8ea6b6] mt-1">
                    <span>{pct.toFixed(0)}% used</span>
                    <span>{formatCurrency(b.amount - b.spent)} left</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">AI Insights</h2>
          <div className="space-y-3">
            {insights.map((i) => {
              const Icon = i.icon
              const colors = {
                warning: "border-[#fbbf24] bg-[#fbbf24]/5",
                success: "border-[#4ade80] bg-[#4ade80]/5",
                danger: "border-[#ff8a70] bg-[#ff8a70]/5",
              }
              return (
                <div key={i.title} className={`p-4 rounded-xl border ${colors[i.type]}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${
                      i.type === "success" ? "text-[#4ade80]" : i.type === "warning" ? "text-[#fbbf24]" : "text-[#ff8a70]"
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{i.title}</p>
                      <p className="text-xs text-[#8ea6b6] mt-0.5">{i.desc}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
