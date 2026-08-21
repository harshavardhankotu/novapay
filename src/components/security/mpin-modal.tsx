"use client"

import { useState } from "react"
import { X } from "lucide-react"

export function MpinModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess?: () => void }) {
  const [pin, setPin] = useState("")
  const [confirm, setConfirm] = useState("")
  const [step, setStep] = useState<"set" | "confirm">("set")
  const [error, setError] = useState("")

  const handleDigit = (d: string) => {
    if (step === "set") {
      if (pin.length < 4) {
        const next = pin + d
        setPin(next)
        setError("")
        if (next.length === 4) { setConfirm(next); setTimeout(() => { setStep("confirm"); setPin("") }, 200) }
      }
    } else {
      if (pin.length < 4) {
        const next = pin + d
        setPin(next)
        if (next.length === 4) {
          if (next === confirm) {
            localStorage.setItem("mpin_" + (localStorage.getItem("userId") || ""), next)
            setError(""); setPin(""); setStep("set")
            onSuccess?.(); onClose()
          } else { setError("PINs don't match"); setStep("set"); setPin(""); setConfirm("") }
        }
      }
    }
  }

  const handleDelete = () => { setPin(p => p.slice(0, -1)); setError("") }

  if (!open) return null

  const displayPin = pin
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#0e2633] rounded-2xl p-6 w-80 border border-[#1e3d4d]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">{step === "set" ? "Set MPIN" : "Confirm MPIN"}</h3>
          <button onClick={() => { setPin(""); setStep("set"); setError(""); onClose() }}><X className="w-5 h-5 text-[#8ea6b6]" /></button>
        </div>
        <p className="text-[#8ea6b6] text-sm mb-4 text-center">
          {step === "set" ? "Enter a 4-digit MPIN" : "Re-enter your MPIN"}
        </p>
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 ${displayPin[i] ? "bg-[#2dd4bf] border-[#2dd4bf]" : "border-[#285064]"}`} />
          ))}
        </div>
        {error && <p className="text-red-400 text-sm text-center mb-2">{error}</p>}
        {step === "confirm" && confirm.length === 0 && (
          <p className="text-[#8ea6b6] text-xs text-center mb-2">Enter the previously set PIN</p>
        )}
        <div className="grid grid-cols-3 gap-3">
          {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k) => (
            <button key={k} disabled={k === ""} onClick={() => k === "⌫" ? handleDelete() : handleDigit(k)}
              className={`h-14 rounded-xl text-xl font-bold ${k === "" ? "invisible" : k === "⌫" ? "bg-[#0e2633] text-white" : "bg-[#0e2633] text-white hover:bg-[#1e3d4d]"}`}>
              {k === "⌫" ? <span className="text-lg">⌫</span> : k}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
