"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { formatCurrency } from "@/lib/utils"
import { Plus, Settings, Lock, Unlock, Clock } from "lucide-react"

const familyMembers = [
  { id: "1", name: "Aarav Kumar", avatar: null, dailyLimit: 5000, monthlyLimit: 50000, isActive: true, spent: 3250 },
  { id: "2", name: "Ananya Kumar", avatar: null, dailyLimit: 3000, monthlyLimit: 30000, isActive: true, spent: 1500 },
]

const recentActivity = [
  { id: "1", name: "Aarav", action: "Paid at Dominos", amount: 849, time: "1h ago", status: "active" },
  { id: "2", name: "Ananya", action: "Swipe at Zomato", amount: 450, time: "3h ago", status: "active" },
  { id: "3", name: "Aarav", action: "Online purchase", amount: 2499, time: "1d ago", status: "blocked" },
]

export default function FamilyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Family Banking</h1>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {familyMembers.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar fallback={m.name.split(" ").map(n => n[0]).join("")} size="lg" />
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {m.isActive ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <Unlock className="h-3 w-3" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Frozen
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#636e72]">Daily Limit</p>
                  <p className="font-medium">{formatCurrency(m.dailyLimit)}</p>
                </div>
                <div>
                  <p className="text-[#636e72]">Monthly Limit</p>
                  <p className="font-medium">{formatCurrency(m.monthlyLimit)}</p>
                </div>
                <div>
                  <p className="text-[#636e72]">Spent Today</p>
                  <p className="font-medium">{formatCurrency(m.spent)}</p>
                </div>
                <div>
                  <p className="text-[#636e72]">Remaining Today</p>
                  <p className="font-medium text-[#00b894]">{formatCurrency(m.dailyLimit - m.spent)}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-[#dfe6e9] dark:border-[#2d3436]">
                <Button variant="outline" size="sm" className="flex-1">
                  {m.isActive ? <Lock className="h-4 w-4 mr-1" /> : <Unlock className="h-4 w-4 mr-1" />}
                  {m.isActive ? "Freeze" : "Unfreeze"}
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Clock className="h-4 w-4 mr-1" />
                  Adjust Limits
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-[#dfe6e9] dark:border-[#2d3436]">
                <div className="flex items-center gap-3">
                  <Avatar fallback={a.name[0]} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{a.name} • {a.action}</p>
                    <p className="text-xs text-[#636e72]">{a.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(a.amount)}</p>
                  <Badge variant={a.status === "active" ? "success" : "destructive"} className="text-[10px]">
                    {a.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
