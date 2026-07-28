"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, Star, TrendingUp, Coffee, Plane, ShoppingBag } from "lucide-react"

const offers = [
  { brand: "Swiggy", desc: "10% cashback on every order", points: 500, color: "#fc8019" },
  { brand: "Amazon", desc: "5% reward rate on Amazon Pay", points: 0, color: "#ff9900" },
  { brand: "MakeMyTrip", desc: "Extra 2x points on flight bookings", points: 1000, color: "#00b894" },
  { brand: "Myntra", desc: "Flat 15% off on fashion", points: 300, color: "#e91e63" },
]

export default function RewardsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">RevPoints Rewards</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="gradient-primary text-white">
          <CardContent className="p-6">
            <Gift className="h-8 w-8 mb-3 opacity-80" />
            <p className="text-sm opacity-80">Your Points</p>
            <p className="text-3xl font-bold">12,450</p>
            <p className="text-xs opacity-70 mt-1">≈ ₹4,980 value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Star className="h-6 w-6 text-[#fdcb6e]" />
              <Badge variant="warning">GOLD</Badge>
            </div>
            <p className="text-sm text-[#636e72]">Your Tier</p>
            <p className="text-lg font-bold">Gold Member</p>
            <p className="text-xs text-[#636e72] mt-1">2,550 points to Platinum</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-6 w-6 text-[#6c5ce7]" />
            </div>
            <p className="text-sm text-[#636e72]">This Month</p>
            <p className="text-lg font-bold">2,340 points</p>
            <p className="text-xs text-[#636e72] mt-1">+18% vs last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {offers.map((offer) => (
              <div key={offer.brand} className="flex items-start gap-4 p-4 rounded-lg border border-[#dfe6e9] dark:border-[#2d3436]">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${offer.color}15` }}>
                  {offer.brand === "Swiggy" ? <Coffee className="h-6 w-6" style={{ color: offer.color }} /> :
                   offer.brand === "MakeMyTrip" ? <Plane className="h-6 w-6" style={{ color: offer.color }} /> :
                   <ShoppingBag className="h-6 w-6" style={{ color: offer.color }} />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{offer.brand}</p>
                  <p className="text-sm text-[#636e72]">{offer.desc}</p>
                  {offer.points > 0 && (
                    <p className="text-xs text-[#6c5ce7] mt-1">Requires {offer.points.toLocaleString()} points</p>
                  )}
                </div>
                <Button variant="outline" size="sm">Redeem</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
