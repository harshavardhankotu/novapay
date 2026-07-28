"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Snowflake, Globe, Eye, Shield, CreditCard, Lock } from "lucide-react"

const cards = [
  {
    id: "1", type: "VIRTUAL", network: "VISA", lastFour: "4521", expiry: "09/28",
    status: "ACTIVE" as const, dailyLimit: 100000, monthlyLimit: 500000,
    gradient: "from-[#5046e5] to-[#7c73f0]",
  },
  {
    id: "2", type: "PHYSICAL", network: "MASTERCARD", lastFour: "8832", expiry: "12/28",
    status: "ACTIVE" as const, dailyLimit: 50000, monthlyLimit: 200000,
    gradient: "from-[#2d3436] to-[#636e72]",
  },
  {
    id: "3", type: "METAL", network: "RUPAY", lastFour: "9901", expiry: "03/29",
    status: "FROZEN" as const, dailyLimit: 250000, monthlyLimit: 1000000,
    gradient: "from-[#b8860b] to-[#daa520]",
  },
]

export default function CardsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cards</h1>
          <p className="text-sm text-[#636e72] mt-0.5">Manage virtual & physical cards</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Get New Card
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {cards.map((card) => (
          <div key={card.id} className={`bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] shadow-sm overflow-hidden animate-slide-up ${card.status === "FROZEN" ? "opacity-85" : ""}`}>
            <div className={`bg-gradient-to-br ${card.gradient} p-6 text-white relative overflow-hidden`}>
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/5" />
              <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/5" />
              <div className="flex items-start justify-between relative">
                <div>
                  <p className="text-xs opacity-80 font-medium tracking-wider uppercase">{card.network}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">{card.type} CARD</p>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] backdrop-blur-sm">{card.type}</Badge>
              </div>
              <div className="mt-5 space-y-1.5 relative">
                <div className="flex items-center gap-2">
                  <p className="text-xl font-mono tracking-[0.2em]">**** **** **** {card.lastFour}</p>
                  <Eye className="h-3.5 w-3.5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
                </div>
                <div className="flex gap-5 text-xs opacity-70">
                  <span>EXP {card.expiry}</span>
                  <span>CVV ***</span>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#f8f9fc] dark:bg-[#1a1a30] rounded-xl p-3">
                  <p className="text-[#636e72] text-xs">Daily Limit</p>
                  <p className="font-semibold mt-0.5">₹{(card.dailyLimit / 1000).toFixed(0)}K</p>
                </div>
                <div className="bg-[#f8f9fc] dark:bg-[#1a1a30] rounded-xl p-3">
                  <p className="text-[#636e72] text-xs">Monthly Limit</p>
                  <p className="font-semibold mt-0.5">₹{(card.monthlyLimit / 1000).toFixed(0)}K</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant={card.status === "ACTIVE" ? "success" : "warning"} className="gap-1">
                  <Shield className="h-3 w-3" />
                  {card.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-[#e8eaed] dark:border-[#2a2a45]">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                  {card.status === "FROZEN" ? <Lock className="h-3.5 w-3.5" /> : <Snowflake className="h-3.5 w-3.5" />}
                  {card.status === "FROZEN" ? "Unfreeze" : "Freeze"}
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
