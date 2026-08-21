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
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-[#1e3d4d] bg-[#071a26]/90 backdrop-blur-lg">
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
                isActive ? "text-[#f2bd68]" : "text-[#8ea6b6] hover:text-white"
              )}
            >
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-gradient-to-r from-[#e8a33d] to-[#2dd4bf]" />
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
