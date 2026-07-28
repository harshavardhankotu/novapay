"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, Star, TrendingUp, Coffee, Plane, ShoppingBag, Zap, Crown, ArrowRight } from "lucide-react"

const offers = [
  { brand: "Swiggy", desc: "10% cashback on every order", points: 500, color: "#fc8019", icon: Coffee },
  { brand: "Amazon", desc: "5% reward rate on Amazon Pay", points: 0, color: "#ff9900", icon: ShoppingBag },
  { brand: "MakeMyTrip", desc: "Extra 2x points on flight bookings", points: 1000, color: "#00b894", icon: Plane },
  { brand: "Myntra", desc: "Flat 15% off on fashion", points: 300, color: "#e91e63", icon: ShoppingBag },
]

const tiers = [
  { name: "Silver", points: 0, color: "#636e72", icon: Star },
  { name: "Gold", points: 5000, color: "#fdcb6e", icon: Crown, current: true },
  { name: "Platinum", points: 15000, color: "#5046e5", icon: Zap },
]

export default function RewardsPage() {
  return (
    <div className="animate-fade-in space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">RevPoints Rewards</h1>
        <p className="text-sm text-[#636e72] mt-0.5">Earn points on every transaction</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#5046e5] to-[#7c73f0] p-6 text-white shadow-lg shadow-[#5046e5]/20 animate-slide-up">
          <Gift className="h-8 w-8 mb-3 opacity-80" />
          <p className="text-sm opacity-80">Your Points</p>
          <p className="text-3xl font-bold mt-1">12,450</p>
          <p className="text-xs opacity-70 mt-1">≈ ₹4,980 value</p>
        </div>
        <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-3 mb-3">
            <Crown className="h-6 w-6 text-[#fdcb6e]" />
            <Badge variant="warning">GOLD</Badge>
          </div>
          <p className="text-xs text-[#636e72]">Your Tier</p>
          <p className="text-lg font-bold mt-0.5">Gold Member</p>
          <p className="text-xs text-[#636e72] mt-1">2,550 points to Platinum</p>
        </div>
        <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-6 w-6 text-[#5046e5]" />
          </div>
          <p className="text-xs text-[#636e72]">This Month</p>
          <p className="text-lg font-bold mt-0.5">2,340 points</p>
          <p className="text-xs text-[#00b894] mt-1">+18% vs last month</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Tier Progression</h2>
          <span className="text-xs text-[#636e72]">Next reset: Dec 31</span>
        </div>
        <div className="flex items-center gap-3">
          {tiers.map((t, i) => {
            const Icon = t.icon
            return (
              <div key={t.name} className={`flex-1 text-center p-3 rounded-xl ${
                t.current ? "bg-[#fdcb6e]/10 border border-[#fdcb6e]/30" : "bg-[#f8f9fc] dark:bg-[#1a1a30]"
              }`}>
                <Icon className={`h-5 w-5 mx-auto mb-1 ${t.current ? "text-[#fdcb6e]" : "text-[#636e72]"}`} />
                <p className="text-xs font-medium">{t.name}</p>
                <p className="text-[10px] text-[#636e72]">{t.points.toLocaleString()} pts</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Available Offers</h2>
          <button className="text-xs text-[#5046e5] hover:underline">View all</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {offers.map((offer) => {
            const Icon = offer.icon
            return (
              <div key={offer.brand} className="flex items-start gap-4 p-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] hover:border-[#5046e5]/20 transition-all hover:shadow-sm">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${offer.color}15` }}>
                  <Icon className="h-6 w-6" style={{ color: offer.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{offer.brand}</p>
                  <p className="text-sm text-[#636e72]">{offer.desc}</p>
                  {offer.points > 0 && (
                    <p className="text-xs text-[#5046e5] mt-1">Requires {offer.points.toLocaleString()} points</p>
                  )}
                </div>
                <Button variant="outline" size="sm" className="shrink-0 gap-1">
                  Redeem <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
