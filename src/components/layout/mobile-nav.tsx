"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Wallet, ArrowUpDown, Smartphone, User } from "lucide-react"

const items = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Payments", href: "/upi", icon: Smartphone },
  { label: "Transfer", href: "/transfers", icon: ArrowUpDown },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Profile", href: "/settings", icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-[#e8eaed] dark:border-[#2a2a45] bg-white/90 dark:bg-[#0a0a14]/90 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-all relative",
                isActive ? "text-[#5046e5]" : "text-[#636e72] hover:text-[#1a1a2e] dark:hover:text-white"
              )}
            >
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#5046e5]" />
              )}
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
