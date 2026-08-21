"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Bell, Lock, Globe, Smartphone, LogOut, ChevronRight, Moon, Sparkles, Palette } from "lucide-react"

const themes = [
  { id: "deepwater", name: "Deepwater & Golden Hour", desc: "Default · amber on deep teal", swatches: ["#e8a33d", "#2dd4bf", "#071a26"] },
  { id: "aurora", name: "Aurora", desc: "Glacial mint & violet", swatches: ["#34d399", "#8b5cf6", "#06121d"] },
  { id: "sunset-dunes", name: "Sunset Dunes", desc: "Warm amber & rose", swatches: ["#fb923c", "#f43f5e", "#1a0f14"] },
]

const sections = [
  { icon: User, label: "Personal Details", desc: "Name, email, phone, address", color: "#e8a33d" },
  { icon: Shield, label: "Security", desc: "Password, biometric, 2FA", color: "#4ade80" },
  { icon: Bell, label: "Notifications", desc: "Push, SMS, email preferences", color: "#fbbf24" },
  { icon: Lock, label: "Privacy", desc: "Data sharing, cookies, consent", color: "#ff8a70" },
  { icon: Globe, label: "Language & Region", desc: "English, Hindi, + more", color: "#f2bd68" },
  { icon: Smartphone, label: "Devices", desc: "Manage logged-in devices", color: "#2dd4bf" },
]

function applyTheme(id: string) {
  if (id === "deepwater") delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = id
}

export default function SettingsPage() {
  const [theme, setTheme] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("novapay_theme") || "deepwater" : "deepwater"
  )

  useEffect(() => {
    const saved = localStorage.getItem("novapay_theme")
    if (saved) applyTheme(saved)
  }, [])

  function selectTheme(id: string) {
    setTheme(id)
    localStorage.setItem("novapay_theme", id)
    applyTheme(id)
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-[#8ea6b6] mt-0.5">Manage your account preferences</p>
      </div>

      <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#e8a33d] to-[#2dd4bf] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#e8a33d]/30">
            NK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-white">Nova User</p>
            <p className="text-sm text-[#8ea6b6]">user@novapay.in</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="success" className="gap-1"><Shield className="h-3 w-3" /> KYC Verified</Badge>
              <Badge variant="secondary">+91 98765 43210</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm">Edit</Button>
        </div>
      </div>

      <div className="space-y-1">
        {/* Theme picker */}
        <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-5 shadow-sm mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="h-5 w-5 text-[#2dd4bf]" />
            <div>
              <p className="text-sm font-medium text-white">Appearance</p>
              <p className="text-xs text-[#8ea6b6]">Pick your vibe — saved on this device</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTheme(t.id)}
                className={`text-left p-3 rounded-xl border transition-all ${theme === t.id ? "border-[#e8a33d]/60 bg-[#e8a33d]/10" : "border-[#1e3d4d] hover:border-[#1e3d4d]/0 hover:bg-[#071a26]"}`}
              >
                <div className="flex gap-1.5 mb-2">
                  {t.swatches.map((s) => (
                    <span key={s} className="h-5 w-5 rounded-full border border-white/10" style={{ backgroundColor: s }} />
                  ))}
                </div>
                <p className="text-xs font-semibold text-white">{t.name}</p>
                <p className="text-[10px] text-[#8ea6b6] mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#0e2633] cursor-pointer transition-colors group border border-transparent hover:border-[#1e3d4d]">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                <Icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{s.label}</p>
                <p className="text-xs text-[#8ea6b6]">{s.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-[#8ea6b6] group-hover:translate-x-0.5 transition-transform" />
            </div>
          )
        })}
      </div>

      <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#e8a33d]/20 to-[#2dd4bf]/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-[#2dd4bf]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Appearance</p>
              <p className="text-xs text-[#8ea6b6]">Cosmic Dark — always on</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8ea6b6]">
            <Moon className="h-4 w-4 text-[#f2bd68]" />
            <span>Dark</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#f87171]/30 bg-[#f87171]/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-[#f87171]">Danger Zone</p>
            <p className="text-sm text-[#8ea6b6]">Permanently close your account</p>
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
