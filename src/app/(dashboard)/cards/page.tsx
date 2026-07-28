"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Snowflake, Eye, EyeOff, Globe } from "lucide-react"

const cards = [
  { id: "1", type: "VIRTUAL", network: "VISA", lastFour: "4521", expiry: "09/28", status: "ACTIVE", dailyLimit: 100000, monthlyLimit: 500000 },
  { id: "2", type: "PHYSICAL", network: "MASTERCARD", lastFour: "8832", expiry: "12/28", status: "ACTIVE", dailyLimit: 50000, monthlyLimit: 200000 },
  { id: "3", type: "METAL", network: "RUPAY", lastFour: "9901", expiry: "03/29", status: "FROZEN", dailyLimit: 250000, monthlyLimit: 1000000 },
]

export default function CardsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cards</h1>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Get New Card
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Card key={card.id} className={`overflow-hidden ${card.status === "FROZEN" ? "opacity-75" : ""}`}>
            <div className={`p-6 ${card.type === "METAL" ? "bg-gradient-to-br from-[#2d3436] to-[#636e72]" : card.type === "PHYSICAL" ? "gradient-card" : "bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe]"} text-white`}>
              <div className="flex items-start justify-between">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">{card.network}</Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px]">{card.type}</Badge>
              </div>
              <div className="mt-4 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-mono tracking-widest">**** **** **** {card.lastFour}</p>
                  <Eye className="h-4 w-4 opacity-70 cursor-pointer" />
                </div>
                <div className="flex gap-6 text-sm opacity-80">
                  <span>Exp: {card.expiry}</span>
                  <span>CVV: ***</span>
                </div>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#636e72]">Status</span>
                <Badge variant={card.status === "ACTIVE" ? "success" : "warning"} className="text-[10px]">
                  {card.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#636e72]">Daily Limit</span>
                <span className="font-medium">₹{(card.dailyLimit / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-[#dfe6e9] dark:border-[#2d3436]">
                <Button variant="outline" size="sm" className="flex-1">
                  <Snowflake className="h-4 w-4 mr-1" />
                  {card.status === "FROZEN" ? "Unfreeze" : "Freeze"}
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Globe className="h-4 w-4 mr-1" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
