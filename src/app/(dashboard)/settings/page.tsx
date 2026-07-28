"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { User, Shield, Bell, Lock, Globe, Smartphone, LogOut, ChevronRight } from "lucide-react"

const sections = [
  { icon: User, label: "Personal Details", desc: "Name, email, phone, address" },
  { icon: Shield, label: "Security", desc: "Password, biometric, 2FA" },
  { icon: Bell, label: "Notifications", desc: "Push, SMS, email preferences" },
  { icon: Lock, label: "Privacy", desc: "Data sharing, cookies, consent" },
  { icon: Globe, label: "Language & Region", desc: "English, Hindi, + more" },
  { icon: Smartphone, label: "Devices", desc: "Manage logged-in devices" },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Avatar fallback="RK" size="xl" />
          <div className="flex-1">
            <p className="text-lg font-semibold">Rahul Kumar</p>
            <p className="text-sm text-[#636e72]">rahul@example.com</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="success">KYC Verified</Badge>
              <Badge variant="secondary">+91 98765 43210</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm">Edit</Button>
        </CardContent>
      </Card>

      <div className="space-y-1">
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-4 p-4 rounded-lg hover:bg-[#f8f9fa] dark:hover:bg-[#2d3436] cursor-pointer transition-colors">
              <div className="h-10 w-10 rounded-lg bg-[#f8f9fa] dark:bg-[#2d3436] flex items-center justify-center">
                <Icon className="h-5 w-5 text-[#636e72]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-[#636e72]">{s.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-[#636e72]" />
            </div>
          )
        })}
      </div>

      <Card className="border-[#d63031]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#d63031]">Danger Zone</p>
              <p className="text-sm text-[#636e72]">Permanently close your account</p>
            </div>
            <Button variant="destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Close Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
