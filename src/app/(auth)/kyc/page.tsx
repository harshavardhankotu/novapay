"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Camera, FileText, Fingerprint, Shield, Check } from "lucide-react"

const steps = [
  { icon: FileText, title: "Aadhaar Verification", desc: "Link your Aadhaar via DigiLocker", done: true },
  { icon: Fingerprint, title: "PAN Verification", desc: "Verify your PAN details", done: true },
  { icon: Camera, title: "Video KYC", desc: "5-min video call with our agent", done: false },
  { icon: Shield, title: "Approval", desc: "Account activated instantly", done: false },
]

export default function KycPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your KYC</CardTitle>
          <CardDescription>RBI requires full KYC. We make it fast.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={step.title} className={`flex items-center gap-4 p-4 rounded-lg border ${
                  step.done
                    ? "border-[#00b894] bg-[#00b894]/5"
                    : "border-[#dfe6e9] dark:border-[#2d3436]"
                }`}>
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    step.done ? "bg-[#00b894] text-white" : "bg-[#f8f9fa] dark:bg-[#2d3436]"
                  }`}>
                    {step.done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5 text-[#636e72]" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-xs text-[#636e72]">{step.desc}</p>
                  </div>
                  {!step.done && (
                    <Button size="sm" variant="outline">Start</Button>
                  )}
                </div>
              )
            })}
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-sm font-medium mb-1 block">Aadhaar Number</label>
              <Input placeholder="XXXX XXXX XXXX" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">PAN Number</label>
              <Input placeholder="ABCDE1234F" />
            </div>
            <Button className="w-full" size="lg">Submit & Continue to Video KYC</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
