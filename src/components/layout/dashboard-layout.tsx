"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { MobileNav } from "./mobile-nav"
import { Chatbot } from "../chatbot/chatbot"
import { Onboarding } from "../onboarding/onboarding"
import { LangProvider } from "@/lib/i18n/provider"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Opportunistic background-job runner: once per session, process any due
  // banking events (FD maturities, EMI auto-debits, mandate pulls) — the way
  // a bank's overnight batch would. Fire-and-forget; failures are silent.
  useEffect(() => {
    if (sessionStorage.getItem("novapay_jobs_ran")) return
    sessionStorage.setItem("novapay_jobs_ran", "1")
    fetch("/api/cron/process", { method: "POST" }).catch(() => {})
  }, [])

  return (
    <LangProvider>
    <div className="flex min-h-screen bg-[#071a26]">
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
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
      <Chatbot />
      <Onboarding />
    </div>
    </LangProvider>
  )
}
