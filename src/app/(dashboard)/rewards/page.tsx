"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, Star, TrendingUp, Coffee, Plane, ShoppingBag, Zap, Crown, ArrowRight, Sparkles, Loader2 } from "lucide-react"

const offers = [
  { brand: "Swiggy", desc: "10% cashback on every order", points: 500, color: "#e8a33d", icon: Coffee },
  { brand: "Amazon", desc: "5% reward rate on Amazon Pay", points: 0, color: "#f2bd68", icon: ShoppingBag },
  { brand: "MakeMyTrip", desc: "Extra 2x points on flight bookings", points: 1000, color: "#2dd4bf", icon: Plane },
  { brand: "Myntra", desc: "Flat 15% off on fashion", points: 300, color: "#ff8a70", icon: ShoppingBag },
]

const tiers = [
  { name: "Nova Silver", points: 0, color: "#8ea6b6", icon: Star },
  { name: "Nova Gold", points: 5000, color: "#fbbf24", icon: Crown, current: true },
  { name: "Nova Platinum", points: 15000, color: "#e8a33d", icon: Zap },
]

export default function RewardsPage() {
  const [rewards, setRewards] = useState<{ points: number; tier: string; cashback: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("/api/rewards")
      .then(r => r.json())
      .then(d => setRewards(d.rewards || d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const points = rewards?.points ?? 0

  async function handleRedeem(offer: typeof offers[number]) {
    if (offer.points <= 0) return
    setRedeeming(offer.brand)
    setMessage("")
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: offer.desc, pointsCost: offer.points }),
      })
      const data = await res.json()
      if (res.ok) {
        setRewards((prev) => prev ? { ...prev, points: prev.points - offer.points } : prev)
        setMessage(`Redeemed ${offer.brand} offer for ${offer.points.toLocaleString()} points!`)
      } else {
        setMessage(data.error || "Redemption failed")
      }
    } catch {
      setMessage("Network error")
    } finally {
      setRedeeming(null)
    }
  }

  const currentTierIndex = tiers.reduce((acc, t, i) => (points >= t.points ? i : acc), 0)
  const nextTier = tiers[currentTierIndex + 1]

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">NovaPoints Rewards</h1>
        <p className="text-sm text-[#8ea6b6] mt-0.5">Earn points on every transaction</p>
      </div>

      {message && (
        <div className="rounded-xl border border-[#2dd4bf]/30 bg-[#2dd4bf]/10 px-4 py-3 text-sm text-[#2dd4bf]">{message}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#062c3a] via-[#0a3a4d] to-[#071a26] p-6 text-white border border-[#e8a33d]/20 shadow-lg shadow-[#e8a33d]/10 animate-slide-up">
          <Sparkles className="h-8 w-8 mb-3 text-[#2dd4bf]" />
          <p className="text-sm text-white/60">Your Points</p>
          {loading ? (
            <Loader2 className="h-7 w-7 mt-1 animate-spin text-white/40" />
          ) : (
            <p className="text-3xl font-bold mt-1">{points.toLocaleString()}</p>
          )}
          <p className="text-xs text-white/50 mt-1">≈ ₹{Math.round(points * 0.4).toLocaleString()} value</p>
        </div>
        <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-5 shadow-sm animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-3 mb-3">
            <Crown className="h-6 w-6 text-[#fbbf24]" />
            <Badge variant="warning">{(tiers[currentTierIndex]?.name || "Nova Silver").toUpperCase()}</Badge>
          </div>
          <p className="text-xs text-[#8ea6b6]">Your Tier</p>
          <p className="text-lg font-bold mt-0.5 text-white">{tiers[currentTierIndex]?.name || "Nova Silver"} Member</p>
          <p className="text-xs text-[#8ea6b6] mt-1">
            {nextTier ? `${(nextTier.points - points).toLocaleString()} points to ${nextTier.name}` : "Top tier reached"}
          </p>
        </div>
        <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-5 shadow-sm animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-6 w-6 text-[#2dd4bf]" />
          </div>
          <p className="text-xs text-[#8ea6b6]">Cashback Earned</p>
          <p className="text-lg font-bold mt-0.5 text-white">₹{(rewards?.cashback ?? 0).toLocaleString()}</p>
          <p className="text-xs text-[#4ade80] mt-1">Lifetime cashback</p>
        </div>
      </div>

      <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Tier Progression</h2>
        </div>
        <div className="flex items-center gap-3">
          {tiers.map((t, i) => {
            const Icon = t.icon
            return (
              <div key={t.name} className={`flex-1 text-center p-3 rounded-xl ${
                i === currentTierIndex ? "bg-[#fbbf24]/10 border border-[#fbbf24]/30" : "bg-[#0e2633]"
              }`}>
                <Icon className={`h-5 w-5 mx-auto mb-1 ${i === currentTierIndex ? "text-[#fbbf24]" : "text-[#8ea6b6]"}`} />
                <p className="text-xs font-medium text-white">{t.name}</p>
                <p className="text-[10px] text-[#8ea6b6]">{t.points.toLocaleString()} pts</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Available Offers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {offers.map((offer) => {
            const Icon = offer.icon
            const affordable = points >= offer.points
            return (
              <div key={offer.brand} className="flex items-start gap-4 p-4 rounded-xl border border-[#1e3d4d] hover:border-[#e8a33d]/20 transition-all card-hover bg-[#0e2633]/50">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${offer.color}20` }}>
                  <Icon className="h-6 w-6" style={{ color: offer.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{offer.brand}</p>
                  <p className="text-sm text-[#8ea6b6]">{offer.desc}</p>
                  {offer.points > 0 && (
                    <p className="text-xs text-[#f2bd68] mt-1">Requires {offer.points.toLocaleString()} points</p>
                  )}
                </div>
                {offer.points > 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!affordable || redeeming === offer.brand}
                    onClick={() => handleRedeem(offer)}
                    className="shrink-0 gap-1 border-[#1e3d4d] text-[#8ea6b6] hover:text-white hover:bg-[#0e2633]"
                  >
                    {redeeming === offer.brand ? <Loader2 className="h-3 w-3 animate-spin" /> : affordable ? <>Redeem <ArrowRight className="h-3 w-3" /></> : "Locked"}
                  </Button>
                ) : (
                  <span className="shrink-0 text-xs text-[#4ade80]">Auto-applied</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}