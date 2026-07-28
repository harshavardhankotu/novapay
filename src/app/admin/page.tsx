"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, FileText, AlertTriangle, TrendingUp } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Badge variant="warning">Compliance Mode</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-lg bg-[#6c5ce7]/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-[#6c5ce7]" />
            </div>
            <div>
              <p className="text-sm text-[#636e72]">Total Users</p>
              <p className="text-2xl font-bold">2,847</p>
              <p className="text-xs text-[#00b894]">+12% this month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-lg bg-[#00b894]/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-[#00b894]" />
            </div>
            <div>
              <p className="text-sm text-[#636e72]">Transactions</p>
              <p className="text-2xl font-bold">₹4.2Cr</p>
              <p className="text-xs text-[#00b894]">Volume this month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-lg bg-[#fdcb6e]/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-[#fdcb6e]" />
            </div>
            <div>
              <p className="text-sm text-[#636e72]">Pending KYC</p>
              <p className="text-2xl font-bold">143</p>
              <p className="text-xs text-[#fdcb6e]">Requires review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-lg bg-[#d63031]/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-[#d63031]" />
            </div>
            <div>
              <p className="text-sm text-[#636e72]">Flags</p>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-[#d63031]">Needs attention</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "KYC Compliance", status: "98.5%", color: "text-[#00b894]" },
              { label: "Audit Trail (10yr)", status: "100%", color: "text-[#00b894]" },
              { label: "Data Localization", status: "Compliant", color: "text-[#00b894]" },
              { label: "FATCA/CRS Reporting", status: "Up to date", color: "text-[#00b894]" },
              { label: "PCI-DSS Compliance", status: "Certified", color: "text-[#00b894]" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-[#dfe6e9] dark:border-[#2d3436]">
                <span className="text-sm">{item.label}</span>
                <span className={`text-sm font-semibold ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
