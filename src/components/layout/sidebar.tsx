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
    <aside className="hidden lg:flex flex-col w-64 border-r border-[#dfe6e9] dark:border-[#2d3436] bg-white dark:bg-[#1a1a2e] h-screen sticky top-0">
      <div className="p-6 border-b border-[#dfe6e9] dark:border-[#2d3436]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-bold text-lg">Revolut</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-[#6c5ce7] text-white shadow-sm"
                  : "text-[#636e72] hover:bg-[#f8f9fa] dark:hover:bg-[#2d3436] hover:text-[#2d3436] dark:hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#dfe6e9] dark:border-[#2d3436] space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-[#6c5ce7] text-white shadow-sm"
                  : "text-[#636e72] hover:bg-[#f8f9fa] dark:hover:bg-[#2d3436] hover:text-[#2d3436] dark:hover:text-white"
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
