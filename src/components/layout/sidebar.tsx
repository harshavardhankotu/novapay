"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Wallet, CreditCard, Smartphone, ArrowUpDown,
  Globe, PieChart, Users, Gift, Settings, HelpCircle,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Cards", href: "/cards", icon: CreditCard },
  { label: "Payments", href: "/upi", icon: Smartphone },
  { label: "Transfers", href: "/transfers", icon: ArrowUpDown },
  { label: "Forex", href: "/forex", icon: Globe },
  { label: "Budgeting", href: "/budgeting", icon: PieChart },
  { label: "Family", href: "/family", icon: Users },
  { label: "Rewards", href: "/rewards", icon: Gift },
]

const bottomItems = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Support", href: "/support", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[#e8eaed] dark:border-[#2a2a45] bg-white dark:bg-[#0a0a14] h-screen sticky top-0 shrink-0">
      <div className="p-5 border-b border-[#e8eaed] dark:border-[#2a2a45]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-[#5046e5]/20">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <div>
            <span className="font-bold text-base">Revolut</span>
            <span className="block text-[10px] text-[#636e72] font-medium tracking-tight">India</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[#5046e5] text-white shadow-md shadow-[#5046e5]/20"
                  : "text-[#636e72] hover:bg-[#f5f6fa] dark:hover:bg-[#1a1a30] hover:text-[#1a1a2e] dark:hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-[#e8eaed] dark:border-[#2a2a45] space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[#5046e5] text-white shadow-md shadow-[#5046e5]/20"
                  : "text-[#636e72] hover:bg-[#f5f6fa] dark:hover:bg-[#1a1a30] hover:text-[#1a1a2e] dark:hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
