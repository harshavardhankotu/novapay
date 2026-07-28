"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Plus, PiggyBank, Target } from "lucide-react"

const budgets = [
  { category: "Food & Dining", amount: 15000, spent: 12250, color: "#6c5ce7" },
  { category: "Shopping", amount: 10000, spent: 8500, color: "#fd79a8" },
  { category: "Transportation", amount: 8000, spent: 3200, color: "#00cec9" },
  { category: "Entertainment", amount: 5000, spent: 4800, color: "#fdcb6e" },
  { category: "Bills & Utilities", amount: 12000, spent: 11000, color: "#00b894" },
]

const insights = [
  { title: "Spent ₹2,449 on Swiggy this month", desc: "That's 15% more than last month", type: "warning" },
  { title: "You saved ₹5,000 this month", desc: "Great job! Increase your savings goal?", type: "success" },
  { title: "Entertainment budget at 96%", desc: "Only ₹200 remaining until reset", type: "danger" },
]

export default function BudgetingPage() {
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Budgeting</h1>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Budget
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-lg bg-[#6c5ce7]/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-[#6c5ce7]" />
            </div>
            <div>
              <p className="text-sm text-[#636e72]">Total Budget</p>
              <p className="text-xl font-bold">{formatCurrency(totalBudget)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-lg bg-[#d63031]/10 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-[#d63031]" />
            </div>
            <div>
              <p className="text-sm text-[#636e72]">Total Spent</p>
              <p className="text-xl font-bold">{formatCurrency(totalSpent)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-lg bg-[#00b894]/10 flex items-center justify-center">
              <PiggyBank className="h-6 w-6 text-[#00b894]" />
            </div>
            <div>
              <p className="text-sm text-[#636e72]">Remaining</p>
              <p className="text-xl font-bold">{formatCurrency(totalBudget - totalSpent)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgets.map((b) => {
              const pct = (b.spent / b.amount) * 100
              return (
                <div key={b.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{b.category}</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#dfe6e9] dark:bg-[#2d3436] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: b.color }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[#636e72] mt-0.5">
                    <span>{pct.toFixed(0)}% used</span>
                    <span>{formatCurrency(b.amount - b.spent)} left</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((i) => (
              <div key={i.title} className={`p-4 rounded-lg border ${
                i.type === "warning" ? "border-[#fdcb6e] bg-[#fdcb6e]/5" :
                i.type === "success" ? "border-[#00b894] bg-[#00b894]/5" :
                "border-[#d63031] bg-[#d63031]/5"
              }`}>
                <p className="text-sm font-medium">{i.title}</p>
                <p className="text-xs text-[#636e72] mt-0.5">{i.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
