"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { APP_NAME } from "@/lib/constants"
import {
  LayoutDashboard, Wallet, CreditCard, Smartphone, ArrowUpDown,
  Globe, PieChart, Users, Gift, Settings, HelpCircle,
  ShieldCheck, Banknote, Receipt, Wifi, PiggyBank, Baby,
  Send, Gem, CandlestickChart, FileText, Landmark, Repeat,
  PiggyBank as Piggy, TrendingUp, BarChart3, Zap, RefreshCw,
  Bell, Monitor, KeyRound, Tag, Calculator, MessageCircle,
  Plus, Shield, Split, Copy, Ship,
} from "lucide-react"

const navSections: { label: string; items: { label: string; href: string; icon: any }[] }[] = [
  { label: "Main", items: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Accounts", href: "/accounts", icon: Wallet },
    { label: "Cards", href: "/cards", icon: CreditCard },
    { label: "UPI", href: "/upi", icon: Smartphone },
    { label: "Transfers", href: "/transfers", icon: ArrowUpDown },
    { label: "Bill Payments", href: "/bills", icon: Zap },
    { label: "Mandates", href: "/mandates", icon: RefreshCw },
    { label: "Forex", href: "/forex", icon: Globe },
    { label: "Budgeting", href: "/budgeting", icon: PieChart },
  ]},
  { label: "Banking", items: [
    { label: "Fixed Deposits", href: "/fixed-deposits", icon: Piggy },
    { label: "Recurring Deposits", href: "/recurring-deposits", icon: Repeat },
    { label: "Loans", href: "/loans", icon: Landmark },
    { label: "Credit Score", href: "/credit-score", icon: TrendingUp },
    { label: "NRE/NRO", href: "/nre-accounts", icon: Globe },
    { label: "RuPay Credit", href: "/rupay-credit", icon: CreditCard },
  ]},
  { label: "Wealth", items: [
    { label: "Mutual Funds", href: "/mutual-funds", icon: BarChart3 },
    { label: "Gold", href: "/gold", icon: Gem },
    { label: "Crypto", href: "/wealth", icon: CandlestickChart },
    { label: "Insurance", href: "/insurance", icon: Shield },
  ]},
  { label: "Features", items: [
    { label: "Family", href: "/family", icon: Users },
    { label: "Kids", href: "/kids", icon: Baby },
    { label: "Security Hub", href: "/security-hub", icon: ShieldCheck },
    { label: "Account Aggregator", href: "/aa", icon: Banknote },
    { label: "International Receiving", href: "/receiving", icon: Receipt },
    { label: "Smart Pockets", href: "/pockets", icon: PiggyBank },
    { label: "eSIM", href: "/esim", icon: Wifi },
    { label: "LRS", href: "/lrs", icon: Globe },
    { label: "Disputes", href: "/disputes", icon: Send },
    { label: "Saved Cards", href: "/saved-cards", icon: CreditCard },
    { label: "Rewards", href: "/rewards", icon: Gift },
    { label: "Statements", href: "/statements", icon: FileText },
    { label: "Offers", href: "/offers", icon: Tag },
    { label: "Referrals", href: "/referrals", icon: Copy },
    { label: "Split Expenses", href: "/expenses", icon: Split },
    { label: "Calculators", href: "/calculators", icon: Calculator },
  ]},
  { label: "Support", items: [
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Help Center", href: "/help", icon: MessageCircle },
    { label: "Support Tickets", href: "/tickets", icon: HelpCircle },
  ]},
  { label: "Security", items: [
    { label: "Sessions", href: "/sessions", icon: Monitor },
    { label: "2FA", href: "/two-factor-auth", icon: KeyRound },
  ]},
]

const bottomItems = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Support", href: "/support", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[#1e3d4d] bg-[#071a26] h-screen sticky top-0 shrink-0">
      <div className="p-5 border-b border-[#1e3d4d]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#e8a33d] to-[#2dd4bf] flex items-center justify-center shadow-lg shadow-[#e8a33d]/20">
            <Ship className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-base text-white">{APP_NAME}</span>
            <span className="block text-[10px] text-[#8ea6b6] font-medium tracking-tight">Finance Beyond Horizons</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
        {navSections.map(section => (
          <div key={section.label}>
            <p className="text-[10px] uppercase tracking-widest text-[#8ea6b6] font-semibold px-3 mb-1">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-[#e8a33d]/20 to-[#2dd4bf]/10 text-white border border-[#e8a33d]/20 shadow-sm"
                        : "text-[#8ea6b6] hover:bg-[#0e2633] hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#f2bd68]" : "")} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-[#1e3d4d] space-y-0.5">
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
                  ? "bg-gradient-to-r from-[#e8a33d]/20 to-[#2dd4bf]/10 text-white border border-[#e8a33d]/20"
                  : "text-[#8ea6b6] hover:bg-[#0e2633] hover:text-white"
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
