"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Activity, AlertTriangle, BarChart3, Download, Search, MoreHorizontal } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const stats = [
  { label: "Total Users", value: "1,24,892", icon: Users, change: "+12.5%", color: "#e8a33d" },
  { label: "Active Today", value: "38,421", icon: Activity, change: "+5.2%", color: "#2dd4bf" },
  { label: "Pending KYC", value: "1,203", icon: AlertTriangle, change: "-8.1%", color: "#fbbf24" },
  { label: "Total Volume", value: "₹48.2Cr", icon: BarChart3, change: "+18.3%", color: "#e8a33d" },
]

const recentUsers = [
  { name: "Priya Sharma", email: "priya@example.com", kyc: "VERIFIED", date: "2m ago", amount: 25000 },
  { name: "Amit Singh", email: "amit@example.com", kyc: "PENDING", date: "15m ago", amount: 5000 },
  { name: "Sneha Patel", email: "sneha@example.com", kyc: "VERIFIED", date: "1h ago", amount: 100000 },
  { name: "Rohit Verma", email: "rohit@example.com", kyc: "REJECTED", date: "2h ago", amount: 0 },
]

export default function AdminPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-[#8ea6b6] mt-0.5">Platform overview & operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" className="gap-1.5">
            <BarChart3 className="h-4 w-4" /> Reports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}10` }}>
                  <Icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <span className="text-xs text-[#8ea6b6]">{s.label}</span>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-[#4ade80] mt-1">{s.change} vs last week</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Users</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8ea6b6]" />
              <input className="w-48 h-9 pl-9 pr-3 rounded-xl border border-[#f3efe6] dark:border-[#1e3d4d] bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d] placeholder:text-[#8ea6b6]" placeholder="Search users..." />
            </div>
          </div>
          <div className="space-y-1">
            {recentUsers.map((u) => (
              <div key={u.email} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f3efe6] dark:hover:bg-[#0e2633] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#e8a33d]/10 flex items-center justify-center text-xs font-bold text-[#e8a33d]">
                    {u.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-[#8ea6b6]">{u.email} • {u.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={u.kyc === "VERIFIED" ? "success" : u.kyc === "PENDING" ? "warning" : "destructive"} className="text-[10px]">{u.kyc}</Badge>
                  <button className="h-7 w-7 rounded-lg hover:bg-[#f3efe6] dark:hover:bg-[#1e3d4d] flex items-center justify-center">
                    <MoreHorizontal className="h-4 w-4 text-[#8ea6b6]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm">
          <h2 className="font-semibold mb-4">System Health</h2>
          <div className="space-y-4">
            {[
              { label: "API Uptime", value: "99.97%", status: "success" as const },
              { label: "UPI Gateway", value: "Operational", status: "success" as const },
              { label: "Database", value: "4.2ms avg", status: "success" as const },
              { label: "SMS Gateway", value: "Degraded", status: "warning" as const },
              { label: "Card Processing", value: "Operational", status: "success" as const },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-[#8ea6b6]">{s.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{s.value}</span>
                  <div className={`h-2 w-2 rounded-full ${
                    s.status === "success" ? "bg-[#4ade80]" : "bg-[#fbbf24]"
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
