"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { MobileNav } from "./mobile-nav"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-[#0a0a14]">
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Topbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto animate-fade-in">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
