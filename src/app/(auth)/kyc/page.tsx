"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, FileText, Shield, Check, ChevronRight, AlertCircle, Loader2, Ship } from "lucide-react"
import { APP_NAME } from "@/lib/constants"

const steps = [
  { icon: FileText, title: "Aadhaar Verification", desc: "Link via DigiLocker", key: "aadhaar" },
  { icon: FileText, title: "PAN Verification", desc: "Verify your PAN details", key: "pan" },
  { icon: Camera, title: "Video KYC", desc: "5-min video call with agent", key: "video" },
  { icon: Shield, title: "Approval", desc: "Account activated instantly", key: "approval" },
]

export default function KycPage() {
  const router = useRouter()
  const [aadhaar, setAadhaar] = useState("")
  const [pan, setPan] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!aadhaar && !pan) { setError("Enter at least Aadhaar or PAN"); return }
    setLoading(true)

    try {
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar: aadhaar || undefined, pan: pan || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "KYC submission failed"); setLoading(false); return }
      const newSteps = [...completedSteps]
      if (aadhaar) newSteps.push("aadhaar")
      if (pan) newSteps.push("pan")
      setCompletedSteps(newSteps)
      setLoading(false)
      if (data.kycLevel === "FULL") {
        router.push("/dashboard")
      }
    } catch {
      setError("Network error")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-[#071a26] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(232,163,61,0.12)_0%,transparent_60%),radial-gradient(ellipse_40%_30%_at_100%_100%,rgba(45,212,191,0.06)_0%,transparent_60%)]" />
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="star" style={{
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
          opacity: Math.random() * 0.5 + 0.2,
          animationDelay: `${Math.random() * 5}s`, animationDuration: `${Math.random() * 3 + 2}s`,
        }} />
      ))}
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#e8a33d] to-[#2dd4bf] flex items-center justify-center mx-auto shadow-lg shadow-[#e8a33d]/30">
            <Ship className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold mt-4 text-white">Complete Your KYC</h1>
          <p className="text-sm text-[#8ea6b6] mt-1">RBI requires full KYC. We make it fast.</p>
        </div>

        <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-6 shadow-sm space-y-5">
          <div className="space-y-3">
            {steps.map((step) => {
              const Icon = step.icon
              const isDone = completedSteps.includes(step.key)
              const isCurrent = !isDone && (step.key === "aadhaar" || (step.key === "pan" && completedSteps.includes("aadhaar")))
              const isLocked = !isDone && !isCurrent

              return (
                <div key={step.title} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isDone ? "border-[#4ade80] bg-[#4ade80]/5" :
                  isCurrent ? "border-[#e8a33d] bg-[#e8a33d]/5" :
                  "border-[#1e3d4d] opacity-50"
                }`}>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isDone ? "bg-[#4ade80] text-[#071a26]" :
                    isCurrent ? "bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] text-white" :
                    "bg-[#0e2633] text-[#8ea6b6]"
                  }`}>
                    {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white">{step.title}</p>
                    <p className="text-xs text-[#8ea6b6]">{step.desc}</p>
                  </div>
                  {isDone && <Badge variant="success" className="text-[10px]">Done</Badge>}
                  {isLocked && <ChevronRight className="h-4 w-4 text-[#8ea6b6]" />}
                </div>
              )
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-[#1e3d4d]">
            <div>
              <label className="text-sm font-medium mb-1.5 block text-white">Aadhaar Number</label>
              <input value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-[#1e3d4d] bg-[#0e2633] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d]/50 placeholder:text-[#8ea6b6]" placeholder="XXXX XXXX XXXX" maxLength={14} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block text-white">PAN Number</label>
              <input value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} className="w-full h-11 px-4 rounded-xl border border-[#1e3d4d] bg-[#0e2633] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d]/50 placeholder:text-[#8ea6b6]" placeholder="ABCDE1234F" maxLength={10} />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#f87171]/10 border border-[#f87171]/20 text-sm text-[#f87171]">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button className="w-full" size="lg" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "Submit & Continue"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
