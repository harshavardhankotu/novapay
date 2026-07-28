"use client"

import { Bell, Search, Menu } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TopbarProps {
  onMenuToggle?: () => void
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-[#dfe6e9] dark:border-[#2d3436] bg-white/80 dark:bg-[#1a1a2e]/80 backdrop-blur-sm px-4 lg:px-6 h-16">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuToggle}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden sm:flex relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#636e72]" />
        <Input placeholder="Search transactions..." className="pl-9 bg-[#f8f9fa] dark:bg-[#2d3436] border-0" />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#d63031]" />
        </Button>
        <Avatar fallback="RK" size="sm" />
      </div>
    </header>
  )
}
