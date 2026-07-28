"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpDown, ArrowRight, User, Building2, Globe } from "lucide-react"

export default function TransfersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transfers</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Send Money</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="neft">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="neft">NEFT / IMPS</TabsTrigger>
                <TabsTrigger value="upi">UPI</TabsTrigger>
                <TabsTrigger value="international">International</TabsTrigger>
              </TabsList>

              <TabsContent value="neft" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Beneficiary</label>
                  <div className="flex gap-2">
                    <Input placeholder="Search saved beneficiaries..." className="flex-1" />
                    <Button variant="outline" size="icon"><User className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Account Number</label>
                    <Input placeholder="Enter account number" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">IFSC Code</label>
                    <Input placeholder="Enter IFSC" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Amount (INR)</label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <Button className="w-full" size="lg">
                  Send <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </TabsContent>

              <TabsContent value="upi" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">UPI ID</label>
                  <Input placeholder="example@upi" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Amount (INR)</label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <Button className="w-full" size="lg">
                  Pay via UPI <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </TabsContent>

              <TabsContent value="international" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Send Amount</label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">From</label>
                    <Input value="INR" disabled />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">To</label>
                    <Input placeholder="USD, EUR, GBP..." />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#f8f9fa] dark:bg-[#2d3436] text-sm">
                  <p className="text-[#636e72]">Exchange Rate</p>
                  <p className="font-medium">1 INR = 0.012 USD</p>
                  <p className="text-[#00b894] text-xs">0% markup • Interbank rate</p>
                </div>
                <Button className="w-full" size="lg">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Beneficiaries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Priya Sharma", type: "BANK", detail: "HDFC Bank ****4521" },
              { name: "Amit Singh", type: "UPI", detail: "amit@paytm" },
              { name: "Mumbai Office", type: "BANK", detail: "ICICI ****7890" },
            ].map((b) => (
              <div key={b.name} className="flex items-center gap-3 p-3 rounded-lg border border-[#dfe6e9] dark:border-[#2d3436]">
                <div className="h-9 w-9 rounded-full bg-[#6c5ce7]/10 flex items-center justify-center">
                  {b.type === "BANK" ? <Building2 className="h-4 w-4 text-[#6c5ce7]" /> : <ArrowUpDown className="h-4 w-4 text-[#6c5ce7]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{b.name}</p>
                  <p className="text-xs text-[#636e72] truncate">{b.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
