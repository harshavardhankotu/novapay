"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, FileText, ShieldCheck, Check, ChevronRight, AlertCircle, Loader2, Ship, Smartphone } from "lucide-react"
import { APP_NAME } from "@/lib/constants"
import { StarField } from "@/components/star-field"
import { validateAadhaar, validatePan } from "@/lib/validation"

const steps = [
  { icon: FileText, title: "Aadhaar Verification", desc: "OTP via DigiLocker (UIDAI)", key: "aadhaar" },
  { icon: FileText, title: "PAN Verification", desc: "Verify your PAN details", key: "pan" },
  { icon: Camera, title: "Video KYC", desc: "5-min video call with agent", key: "video" },
  { icon: ShieldCheck, title: "Approval", desc: "Account activated instantly", key: "approval" },
]

export default function KycPage() {
  const router = useRouter()

  // eKYC state
  const [aadhaar, setAadhaar] = useState("")
  const [pan, setPan] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [demoOtp, setDemoOtp] = useState("")
  const [maskedAadhaar, setMaskedAadhaar] = useState("")
  const [aadhaarVerified, setAadhaarVerified] = useState(false)
  const [panVerified, setPanVerified] = useState(false)
  const [kycLevel, setKycLevel] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const aadhaarDigits = aadhaar.replace(/\D/g, "").slice(0, 12)
  const displayAadhaar = aadhaarDigits.replace(/(\d{4})(?=\d)/g, "$1 ")
  const panUpper = pan.toUpperCase().slice(0, 10)

  async function sendAadhaarOtp() {
    setError("")
    if (!validateAadhaar(aadhaarDigits)) {
      setError("Invalid Aadhaar number. It must be 12 digits and pass the UIDAI checksum.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/kyc", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar: aadhaarDigits }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Failed to send OTP"); return }
      setOtpSent(true)
      setDemoOtp(data.demoOtp || "")
      setMaskedAadhaar(data.maskedAadhaar || "")
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  async function submitKyc() {
    setError("")

    if (!aadhaarVerified && !otpSent) {
      setError("Verify your Aadhaar first"); return
    }
    if (!aadhaarVerified && otpCode.length !== 6) {
      setError("Enter the 6-digit OTP"); return
    }
    if (!validatePan(panUpper)) {
      setError("Invalid PAN format. Expected ABCDE1234F."); return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pan: panUpper,
          ...(aadhaarVerified ? {} : { otpCode }),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "KYC submission failed"); return }
      if (data.aadhaarVerified) setAadhaarVerified(true)
      if (data.panVerified) setPanVerified(true)
      setKycLevel(data.kycLevel)
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const completedSteps = [
    ...(aadhaarVerified ? ["aadhaar"] : []),
    ...(panVerified ? ["pan"] : []),
    ...(kycLevel === "FULL" ? ["video", "approval"] : []),
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-[#071a26] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(232,163,61,0.12)_0%,transparent_60%),radial-gradient(ellipse_40%_30%_at_100%_100%,rgba(45,212,191,0.06)_0%,transparent_60%)]" />
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

          {/* Success state */}
          {kycLevel === "FULL" ? (
            <div className="space-y-4 pt-2 border-t border-[#1e3d4d]">
              <div className="h-16 w-16 rounded-2xl bg-[#4ade80]/10 flex items-center justify-center mx-auto">
                <ShieldCheck className="h-8 w-8 text-[#4ade80]" />
              </div>
              <p className="text-center text-sm text-[#8ea6b6]">
                Aadhaar & PAN verified. Your account is now <strong className="text-white">fully activated</strong>.
              </p>
              <Button className="w-full" size="lg" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          ) : kycLevel && kycLevel !== "FULL" ? (
            <div className="space-y-4 pt-2 border-t border-[#1e3d4d]">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-sm text-[#fbbf24]">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>KYC level: <strong>{kycLevel}</strong>. Video verification pending — you can explore with limits.</span>
              </div>
              <Button className="w-full" size="lg" onClick={() => router.push("/dashboard")}>
                Continue to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-3 pt-2 border-t border-[#1e3d4d]">
              {/* Aadhaar step */}
              {!aadhaarVerified && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-white">Aadhaar Number</label>
                    <input
                      value={displayAadhaar}
                      onChange={(e) => setAadhaar(e.target.value)}
                      disabled={otpSent}
                      inputMode="numeric"
                      className="w-full h-11 px-4 rounded-xl border border-[#1e3d4d] bg-[#0e2633] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d]/50 placeholder:text-[#8ea6b6] disabled:opacity-60"
                      placeholder="XXXX XXXX XXXX"
                      maxLength={14}
                    />
                    {aadhaarDigits.length > 0 && !validateAadhaar(aadhaarDigits) && (
                      <p className="text-xs text-[#fbbf24] mt-1.5 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {aadhaarDigits.length < 12 ? `${12 - aadhaarDigits.length} more digits needed` : "Fails UIDAI checksum — please re-check"}
                      </p>
                    )}
                    {aadhaarDigits.length === 12 && validateAadhaar(aadhaarDigits) && (
                      <p className="text-xs text-[#4ade80] mt-1.5 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Valid format
                      </p>
                    )}
                  </div>

                  {!otpSent ? (
                    <Button className="w-full gap-2" onClick={sendAadhaarOtp} disabled={loading || !validateAadhaar(aadhaarDigits)}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
                      Send OTP to Aadhaar-linked mobile
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium block text-white">OTP sent to {maskedAadhaar}-linked mobile</label>
                      <input
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        inputMode="numeric"
                        autoFocus
                        maxLength={6}
                        className="w-full h-12 bg-[#071a26] border border-[#1e3d4d] rounded-xl text-white text-xl tracking-[0.4em] text-center focus:outline-none focus:border-[#e8a33d]/60 placeholder:text-[#8ea6b6]/40"
                        placeholder="••••••"
                      />
                      {demoOtp && (
                        <p className="text-xs text-[#2dd4bf] bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 rounded-lg px-3 py-2">
                          Demo mode (UIDAI sandbox): your OTP is <strong className="tracking-widest">{demoOtp}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
              {aadhaarVerified && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20 text-sm text-[#4ade80]">
                  <Check className="h-4 w-4 shrink-0" /> Aadhaar verified via DigiLocker
                </div>
              )}

              {/* PAN step */}
              <div>
                <label className="text-sm font-medium mb-1.5 block text-white">PAN Number</label>
                <input
                  value={panUpper}
                  onChange={(e) => setPan(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-[#1e3d4d] bg-[#0e2633] text-white text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d]/50 placeholder:text-[#8ea6b6]"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
                {panUpper.length > 0 && !validatePan(panUpper) && (
                  <p className="text-xs text-[#fbbf24] mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Format: 5 letters, 4 digits, 1 letter (ABCDE1234F)
                  </p>
                )}
                {panUpper.length === 10 && validatePan(panUpper) && (
                  <p className="text-xs text-[#4ade80] mt-1.5 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Valid format
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#f87171]/10 border border-[#f87171]/20 text-sm text-[#f87171]">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button className="w-full" size="lg" onClick={submitKyc} disabled={loading || !aadhaarDigits || panUpper.length < 10}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</> : aadhaarVerified ? "Submit & Continue" : "Verify Aadhaar OTP & Submit"}
              </Button>

              <p className="text-[10px] text-[#8ea6b6] text-center leading-relaxed">
                Your documents are verified through DigiLocker &amp; NSDL. {APP_NAME} never stores raw Aadhaar numbers in plaintext.
              </p>
            </div>
          )}
        </div>

        <p className="text-center mt-6">
          <a href="/dashboard" className="text-sm text-[#8ea6b6] hover:text-white inline-flex items-center gap-1">
            Skip for now
          </a>
        </p>
      </div>
    </div>
  )
}