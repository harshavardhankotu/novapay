"use client"
import { useState, useEffect } from "react"
import { X, Smartphone, ShieldCheck, CreditCard, ArrowUpDown, Sparkles } from "lucide-react"
import { APP_NAME } from "@/lib/constants"

const steps = [
  { icon: Smartphone, title: "Set up UPI", desc: "Create your UPI ID for instant payments" },
  { icon: ShieldCheck, title: "Complete KYC", desc: "Verify your identity with Aadhaar & PAN" },
  { icon: CreditCard, title: "Order a Card", desc: "Get a virtual or physical card" },
  { icon: ArrowUpDown, title: "First Transfer", desc: "Send money to any bank account" },
]

export function Onboarding() {
  const seen = typeof window !== "undefined" ? localStorage.getItem("onboarding_seen") : "true"
  const [open, setOpen] = useState(() => !seen)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (open) localStorage.setItem("onboarding_seen", "true")
  }, [open])

  if (!open) return null

  const s = steps[step]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0e2633] rounded-2xl p-8 w-80 border border-[#1e3d4d] text-center relative">
        <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-[#8ea6b6] hover:text-white"><X className="w-5 h-5" /></button>
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#e8a33d]/20 to-[#2dd4bf]/20 flex items-center justify-center mx-auto mb-4">
          <s.icon className="w-8 h-8 text-[#f2bd68]" />
        </div>
        <h2 className="text-white text-xl font-bold mb-2">{s.title}</h2>
        <p className="text-[#8ea6b6] text-sm mb-6">{s.desc}</p>
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i === step ? "bg-gradient-to-r from-[#e8a33d] to-[#2dd4bf] w-4" : "bg-[#1e3d4d]"}`} />)}
        </div>
        <div className="flex gap-3">
          <button onClick={() => { if (step < steps.length - 1) setStep(s => s + 1); else setOpen(false) }} className="flex-1 bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] hover:from-[#d18a24] hover:to-[#e0a64a] text-[#1a1206] rounded-lg py-2.5 text-sm font-medium shadow-lg shadow-[#e8a33d]/25">{step < steps.length - 1 ? "Next" : "Launch Dashboard"}</button>
          <button onClick={() => setOpen(false)} className="text-[#8ea6b6] text-sm hover:text-white">Skip</button>
        </div>
        <p className="text-[10px] text-[#8ea6b6] mt-4">Welcome to {APP_NAME}! Let&apos;s get started</p>
      </div>
    </div>
  )
}
