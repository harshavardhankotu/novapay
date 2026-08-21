"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Plus, Settings, Lock, Unlock, Clock, Users, Shield, SlidersHorizontal } from "lucide-react"

const familyMembers = [
  { id: "1", name: "Aarav Kumar", initials: "AK", dailyLimit: 5000, monthlyLimit: 50000, isActive: true, spent: 3250, color: "#e8a33d" },
  { id: "2", name: "Ananya Kumar", initials: "AN", dailyLimit: 3000, monthlyLimit: 30000, isActive: true, spent: 1500, color: "#ff8a70" },
]

const recentActivity = [
  { id: "1", name: "Aarav", action: "Paid at Dominos", amount: 849, time: "1h ago", status: "active" as const },
  { id: "2", name: "Ananya", action: "Swipe at Zomato", amount: 450, time: "3h ago", status: "active" as const },
  { id: "3", name: "Aarav", action: "Online purchase", amount: 2499, time: "1d ago", status: "blocked" as const },
]

export default function FamilyPage() {
  return (
    <div className="animate-fade-in space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Family Banking</h1>
          <p className="text-sm text-[#8ea6b6] mt-0.5">Manage spending for your loved ones</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {familyMembers.map((m, i) => (
          <div key={m.id} className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: m.color }}>
                  {m.initials}
                </div>
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <div className="mt-1">
                    <Badge variant={m.isActive ? "success" : "warning"} className="gap-1 text-[10px]">
                      {m.isActive ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {m.isActive ? "Active" : "Frozen"}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4 text-[#8ea6b6]" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#f3efe6] dark:bg-[#0e2633] rounded-xl p-3">
                <p className="text-xs text-[#8ea6b6]">Daily Limit</p>
                <p className="font-semibold mt-0.5">{formatCurrency(m.dailyLimit)}</p>
              </div>
              <div className="bg-[#f3efe6] dark:bg-[#0e2633] rounded-xl p-3">
                <p className="text-xs text-[#8ea6b6]">Monthly Limit</p>
                <p className="font-semibold mt-0.5">{formatCurrency(m.monthlyLimit)}</p>
              </div>
              <div className="bg-[#f3efe6] dark:bg-[#0e2633] rounded-xl p-3">
                <p className="text-xs text-[#8ea6b6]">Spent Today</p>
                <p className="font-semibold mt-0.5">{formatCurrency(m.spent)}</p>
              </div>
              <div className="bg-[#f3efe6] dark:bg-[#0e2633] rounded-xl p-3">
                <p className="text-xs text-[#8ea6b6]">Remaining</p>
                <p className="font-semibold mt-0.5 text-[#4ade80]">{formatCurrency(m.dailyLimit - m.spent)}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#f3efe6] dark:border-[#1e3d4d] flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                {m.isActive ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                {m.isActive ? "Freeze" : "Unfreeze"}
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Adjust Limits
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-2">
          {recentActivity.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f3efe6] dark:hover:bg-[#0e2633] transition-colors">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  a.status === "active" ? "bg-[#e8a33d]/10" : "bg-[#ff8a70]/10"
                }`}>
                  <Shield className={`h-4 w-4 ${a.status === "active" ? "text-[#e8a33d]" : "text-[#ff8a70]"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{a.name} • {a.action}</p>
                  <p className="text-xs text-[#8ea6b6]">{a.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatCurrency(a.amount)}</p>
                <Badge variant={a.status === "active" ? "success" : "destructive"} className="text-[10px]">{a.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
