"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Lightbulb, TrendingUp, TrendingDown, AlertTriangle, PiggyBank, Target } from "lucide-react"

const insights = [
  {
    icon: TrendingUp, color: "#ff8a70", title: "Spending is up 12% this month",
    desc: "Your spending increased compared to last month. Dining out and shopping are the main drivers.",
    type: "danger" as const,
  },
  {
    icon: PiggyBank, color: "#2dd4bf", title: "You saved ₹5,200 this month",
    desc: "Great job staying within budget! Increase your monthly savings goal by 10%?",
    type: "success" as const,
  },
  {
    icon: AlertTriangle, color: "#fbbf24", title: "Entertainment budget nearly exhausted",
    desc: "You've used 96% of your entertainment budget. Only ₹200 remaining for the month.",
    type: "warning" as const,
  },
  {
    icon: Target, color: "#e8a33d", title: "Subscription audit available",
    desc: "You're paying for 4 streaming services. Potential savings of ₹1,200/month by consolidating.",
    type: "info" as const,
  },
  {
    icon: Lightbulb, color: "#e8a33d", title: "Weekend spending pattern detected",
    desc: "60% of your dining spend happens on weekends. Setting a weekend dining budget could save ₹3,000/month.",
    type: "info" as const,
  },
]

export default function BudgetInsightsPage() {
  const router = useRouter()

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[#8ea6b6] hover:text-white dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Budgeting
      </button>

      <div>
        <h1 className="text-2xl font-bold">AI Spending Insights</h1>
        <p className="text-sm text-[#8ea6b6] mt-0.5">Personalized recommendations powered by transaction analysis</p>
      </div>

      <div className="space-y-3">
        {insights.map((i) => {
          const Icon = i.icon
          const typeStyles = {
            danger: "border-[#ff8a70]/30 bg-[#ff8a70]/5",
            success: "border-[#4ade80]/30 bg-[#4ade80]/5",
            warning: "border-[#fbbf24]/30 bg-[#fbbf24]/5",
            info: "border-[#e8a33d]/20 bg-[#e8a33d]/5",
          }
          return (
            <div key={i.title} className={`rounded-2xl border p-5 ${typeStyles[i.type]} animate-slide-up`}>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${i.color}15` }}>
                  <Icon className="h-6 w-6" style={{ color: i.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{i.title}</h3>
                  <p className="text-sm text-[#8ea6b6] mt-1">{i.desc}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
