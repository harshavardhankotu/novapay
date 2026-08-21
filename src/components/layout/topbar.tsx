"use client"

import { Bell, Search, Menu, LogOut, Sparkles } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/store/user-store"
import { useRouter } from "next/navigation"

interface TopbarProps {
  onMenuToggle?: () => void
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, logout } = useUserStore()
  const router = useRouter()

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "U"

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#1e3d4d] bg-[#071a26]/80 backdrop-blur-xl px-4 lg:px-6 h-16">
      <Button variant="ghost" size="icon-sm" className="lg:hidden -ml-1 text-[#8ea6b6] hover:text-white hover:bg-[#0e2633]" onClick={onMenuToggle}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden sm:flex relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8ea6b6]" />
        <input
          placeholder="Search transactions..."
          className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#0e2633] border border-[#1e3d4d] text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d]/30 placeholder:text-[#8ea6b6]"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon-sm" className="text-[#8ea6b6] hover:text-white hover:bg-[#0e2633]">
          <Sparkles className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" className="relative text-[#8ea6b6] hover:text-white hover:bg-[#0e2633]">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#f87171] ring-2 ring-[#071a26]" />
        </Button>
        <div className="flex items-center gap-2 pl-2 border-l border-[#1e3d4d]">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-medium text-white">{user?.name || "User"}</p>
            <p className="text-[10px] text-[#8ea6b6]">{user?.kycLevel === "FULL" ? "KYC Verified" : "KYC Pending"}</p>
          </div>
          <Avatar fallback={initials} size="sm" />
          <button onClick={() => { logout(); router.push("/login") }} className="ml-1 p-1.5 rounded-lg hover:bg-[#0e2633] transition-colors">
            <LogOut className="h-3.5 w-3.5 text-[#8ea6b6] hover:text-[#f87171]" />
          </button>
        </div>
      </div>
    </header>
  )
}
