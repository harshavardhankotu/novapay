"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Bell, Lock, Globe, Smartphone, LogOut, ChevronRight, Moon, Sun } from "lucide-react"
import * as React from "react"

const sections = [
  { icon: User, label: "Personal Details", desc: "Name, email, phone, address", color: "#5046e5" },
  { icon: Shield, label: "Security", desc: "Password, biometric, 2FA", color: "#00b894" },
  { icon: Bell, label: "Notifications", desc: "Push, SMS, email preferences", color: "#fdcb6e" },
  { icon: Lock, label: "Privacy", desc: "Data sharing, cookies, consent", color: "#e17055" },
  { icon: Globe, label: "Language & Region", desc: "English, Hindi, + more", color: "#6c5ce7" },
  { icon: Smartphone, label: "Devices", desc: "Manage logged-in devices", color: "#00cec9" },
]

export default function SettingsPage() {
  const [darkMode, setDarkMode] = React.useState(false)

  React.useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"))
  }, [])

  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle("dark", next)
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-[#636e72] mt-0.5">Manage your account preferences</p>
      </div>

      <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#5046e5] to-[#7c73f0] flex items-center justify-center text-white font-bold text-xl">
            RK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold">Rahul Kumar</p>
            <p className="text-sm text-[#636e72]">rahul@example.com</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="success" className="gap-1"><Shield className="h-3 w-3" /> KYC Verified</Badge>
              <Badge variant="secondary">+91 98765 43210</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm">Edit</Button>
        </div>
      </div>

      <div className="space-y-1">
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#f8f9fc] dark:hover:bg-[#1a1a30] cursor-pointer transition-colors group">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}10` }}>
                <Icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-[#636e72]">{s.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-[#636e72] group-hover:translate-x-0.5 transition-transform" />
            </div>
          )
        })}
      </div>

      <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#5046e5]/10 flex items-center justify-center">
              {darkMode ? <Moon className="h-5 w-5 text-[#5046e5]" /> : <Sun className="h-5 w-5 text-[#5046e5]" />}
            </div>
            <div>
              <p className="text-sm font-medium">Appearance</p>
              <p className="text-xs text-[#636e72]">{darkMode ? "Dark mode" : "Light mode"}</p>
            </div>
          </div>
          <button
            onClick={toggleDark}
            className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? "bg-[#5046e5]" : "bg-[#dfe6e9]"}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${darkMode ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e17055]/30 bg-[#e17055]/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-[#e17055]">Danger Zone</p>
            <p className="text-sm text-[#636e72]">Permanently close your account</p>
          </div>
          <Button variant="destructive" size="sm" className="gap-1.5">
            <LogOut className="h-4 w-4" />
            Close Account
          </Button>
        </div>
      </div>
    </div>
  )
}
