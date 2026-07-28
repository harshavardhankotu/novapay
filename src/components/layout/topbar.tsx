"use client"

import { Bell, Search, Menu, Moon, Sun } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface TopbarProps {
  onMenuToggle?: () => void
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#e8eaed] dark:border-[#2a2a45] bg-white/80 dark:bg-[#0a0a14]/80 backdrop-blur-xl px-4 lg:px-6 h-16">
      <Button variant="ghost" size="icon-sm" className="lg:hidden -ml-1" onClick={onMenuToggle}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden sm:flex relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#636e72]" />
        <input
          placeholder="Search transactions..."
          className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#f5f6fa] dark:bg-[#1a1a30] border-0 text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 placeholder:text-[#636e72]"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon-sm">
          <Moon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#d63031] ring-2 ring-white dark:ring-[#0a0a14]" />
        </Button>
        <div className="flex items-center gap-2 pl-2 border-l border-[#e8eaed] dark:border-[#2a2a45]">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-medium">Rahul Kumar</p>
            <p className="text-[10px] text-[#636e72]">Gold Member</p>
          </div>
          <Avatar fallback="RK" size="sm" />
        </div>
      </div>
    </header>
  )
}
