"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, FileText, Shield, Check, ChevronRight, AlertCircle, Loader2 } from "lucide-react"

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
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#f8f9fc] to-white dark:from-[#0a0a14] dark:to-[#15152a]">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-lg shadow-[#5046e5]/20">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold mt-4">Complete Your KYC</h1>
          <p className="text-sm text-[#636e72] mt-1">RBI requires full KYC. We make it fast.</p>
        </div>

        <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-6 shadow-sm space-y-5">
          <div className="space-y-3">
            {steps.map((step) => {
              const Icon = step.icon
              const isDone = completedSteps.includes(step.key)
              const isCurrent = !isDone && (step.key === "aadhaar" || (step.key === "pan" && completedSteps.includes("aadhaar")))
              const isLocked = !isDone && !isCurrent

              return (
                <div key={step.title} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isDone ? "border-[#00b894] bg-[#00b894]/5" :
                  isCurrent ? "border-[#5046e5] bg-[#5046e5]/5" :
                  "border-[#e8eaed] dark:border-[#2a2a45] opacity-50"
                }`}>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isDone ? "bg-[#00b894] text-white" :
                    isCurrent ? "bg-[#5046e5] text-white" :
                    "bg-[#f5f6fa] dark:bg-[#1a1a30] text-[#636e72]"
                  }`}>
                    {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-xs text-[#636e72]">{step.desc}</p>
                  </div>
                  {isDone && <Badge variant="success" className="text-[10px]">Done</Badge>}
                  {isLocked && <ChevronRight className="h-4 w-4 text-[#636e72]" />}
                </div>
              )
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-[#e8eaed] dark:border-[#2a2a45]">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Aadhaar Number</label>
              <input value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]" placeholder="XXXX XXXX XXXX" maxLength={14} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">PAN Number</label>
              <input value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]" placeholder="ABCDE1234F" maxLength={10} />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#e17055]/5 border border-[#e17055]/20 text-sm text-[#e17055]">
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
