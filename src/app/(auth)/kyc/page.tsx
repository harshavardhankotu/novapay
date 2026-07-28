"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, FileText, Fingerprint, Shield, Check, ChevronRight } from "lucide-react"

const steps = [
  { icon: FileText, title: "Aadhaar Verification", desc: "Link via DigiLocker", status: "done" },
  { icon: Fingerprint, title: "PAN Verification", desc: "Verify your PAN details", status: "done" },
  { icon: Camera, title: "Video KYC", desc: "5-min video call with agent", status: "current" },
  { icon: Shield, title: "Approval", desc: "Account activated instantly", status: "pending" },
]

export default function KycPage() {
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
            {steps.map((step, i) => {
              const Icon = step.icon
              const statusColors: Record<string, string> = {
                done: "border-[#00b894] bg-[#00b894]/5",
                current: "border-[#5046e5] bg-[#5046e5]/5",
                pending: "border-[#e8eaed] dark:border-[#2a2a45] opacity-50",
              }
              const iconColors: Record<string, string> = {
                done: "bg-[#00b894] text-white",
                current: "bg-[#5046e5] text-white",
                pending: "bg-[#f5f6fa] dark:bg-[#1a1a30] text-[#636e72]",
              }
              return (
                <div key={step.title} className={`flex items-center gap-4 p-4 rounded-xl border ${statusColors[step.status]}`}>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconColors[step.status]}`}>
                    {step.status === "done" ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-xs text-[#636e72]">{step.desc}</p>
                  </div>
                  {step.status === "done" && <Badge variant="success" className="text-[10px]">Done</Badge>}
                  {step.status === "current" && <Button size="sm" variant="primary" className="shrink-0">Start</Button>}
                  {step.status === "pending" && <ChevronRight className="h-4 w-4 text-[#636e72]" />}
                </div>
              )
            })}
          </div>

          <div className="space-y-3 pt-2 border-t border-[#e8eaed] dark:border-[#2a2a45]">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Aadhaar Number</label>
              <input className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]" placeholder="XXXX XXXX XXXX" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">PAN Number</label>
              <input className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]" placeholder="ABCDE1234F" />
            </div>
            <Button className="w-full" size="lg">Submit & Continue to Video KYC</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
