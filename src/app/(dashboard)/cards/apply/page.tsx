"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CreditCard, Shield, Check, ArrowRight, AlertCircle } from "lucide-react"

const cardOptions = [
  { id: "VIRTUAL", name: "Virtual Card", desc: "Instant, free, use online", price: "Free", color: "#5046e5" },
  { id: "PHYSICAL", name: "Physical Card", desc: "Plastic card delivered to you", price: "₹199", color: "#2d3436" },
  { id: "METAL", name: "Metal Card", desc: "Premium metal card", price: "₹999", color: "#b8860b" },
]

const networkOptions = ["VISA", "MASTERCARD", "RUPAY"]

export default function ApplyCardPage() {
  const router = useRouter()
  const [type, setType] = useState("VIRTUAL")
  const [network, setNetwork] = useState("VISA")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, network }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Failed to create card"); setLoading(false); return }
      setSuccess(true)
      setLoading(false)
      setTimeout(() => router.push("/cards"), 2000)
    } catch {
      setError("Network error")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="animate-fade-in max-w-md mx-auto text-center space-y-4 py-12">
        <div className="h-16 w-16 rounded-2xl bg-[#00b894]/10 flex items-center justify-center mx-auto">
          <Check className="h-8 w-8 text-[#00b894]" />
        </div>
        <h2 className="text-xl font-bold">Card Created!</h2>
        <p className="text-sm text-[#636e72]">Your new {type.toLowerCase()} card has been issued. Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-lg">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[#636e72] hover:text-[#1a1a2e] dark:hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div>
        <h1 className="text-2xl font-bold">Apply for a Card</h1>
        <p className="text-sm text-[#636e72] mt-0.5">Choose your card type and network</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Card Type</h2>
        {cardOptions.map((opt) => (
          <button key={opt.id} onClick={() => setType(opt.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${type === opt.id ? "border-[#5046e5] bg-[#5046e5]/5" : "border-[#e8eaed] dark:border-[#2a2a45] hover:border-[#5046e5]/30"}`}>
            <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${opt.color}15` }}>
              <CreditCard className="h-6 w-6" style={{ color: opt.color }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{opt.name}</p>
              <p className="text-sm text-[#636e72]">{opt.desc}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{opt.price}</p>
            </div>
          </button>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-medium mb-3">Card Network</h2>
        <div className="flex gap-2">
          {networkOptions.map((n) => (
            <button key={n} onClick={() => setNetwork(n)} className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${network === n ? "border-[#5046e5] bg-[#5046e5]/5 text-[#5046e5]" : "border-[#e8eaed] dark:border-[#2a2a45] hover:border-[#5046e5]/30"}`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#f8f9fc] dark:bg-[#1a1a30] rounded-xl p-4 flex items-start gap-3 text-sm">
        <Shield className="h-5 w-5 text-[#00b894] shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Secure & Regulated</p>
          <p className="text-xs text-[#636e72]">Your card details are encrypted and PCI-DSS compliant. No CVV stored.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#e17055]/5 border border-[#e17055]/20 text-sm text-[#e17055]">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      <Button className="w-full" size="lg" onClick={handleSubmit} disabled={loading}>
        {loading ? "Creating card..." : `Get ${type === "VIRTUAL" ? "Virtual" : type === "PHYSICAL" ? "Physical" : "Metal"} Card`}
        {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  )
}
