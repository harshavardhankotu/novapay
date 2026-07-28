"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, Send, Download, Plus, Wallet, CreditCard, TrendingUp, DollarSign } from "lucide-react"

const accounts = [
  { name: "INR Wallet", balance: 1248500, currency: "INR", type: "SAVINGS", upi: "rahul@revolut" },
  { name: "USD Wallet", balance: 2500, currency: "USD", type: "CURRENT", upi: null },
  { name: "EUR Wallet", balance: 1200, currency: "EUR", type: "CURRENT", upi: null },
]

const recentTransactions = [
  { id: "1", type: "DEBIT", amount: 2499, category: "Food & Dining", description: "Swiggy Order", counterparty: "Swiggy", timestamp: new Date(Date.now() - 2 * 3600000), status: "COMPLETED" },
  { id: "2", type: "CREDIT", amount: 85000, category: "Salary", description: "Salary Credit", counterparty: "ABC Corp", timestamp: new Date(Date.now() - 24 * 3600000), status: "COMPLETED" },
  { id: "3", type: "DEBIT", amount: 15999, category: "Shopping", description: "Amazon Pay", counterparty: "Amazon", timestamp: new Date(Date.now() - 48 * 3600000), status: "COMPLETED" },
  { id: "4", type: "DEBIT", amount: 450, category: "Transportation", description: "Uber Ride", counterparty: "Uber", timestamp: new Date(Date.now() - 72 * 3600000), status: "COMPLETED" },
  { id: "5", type: "CREDIT", amount: 5000, category: "Transfer", description: "Refund", counterparty: "Flipkart", timestamp: new Date(Date.now() - 96 * 3600000), status: "COMPLETED" },
]

export default function DashboardPage() {
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Statement
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Money
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 gradient-primary text-white card-pattern">
          <CardContent className="p-6">
            <p className="text-sm opacity-80">Total Balance</p>
            <h2 className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</h2>
            <div className="flex items-center gap-2 mt-2 text-sm opacity-80">
              <TrendingUp className="h-4 w-4" />
              <span>+2.5% this month</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs opacity-80">INR</p>
                <p className="font-semibold">{formatCurrency(accounts[0].balance, "INR")}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs opacity-80">USD</p>
                <p className="font-semibold">{formatCurrency(accounts[1].balance, "USD")}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs opacity-80">EUR</p>
                <p className="font-semibold">{formatCurrency(accounts[2].balance, "EUR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg bg-[#6c5ce7]/10 flex items-center justify-center">
                <Send className="h-6 w-6 text-[#6c5ce7]" />
              </div>
              <div>
                <p className="text-sm text-[#636e72]">Sent This Month</p>
                <p className="text-xl font-bold">{formatCurrency(42500)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg bg-[#00b894]/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[#00b894]" />
              </div>
              <div>
                <p className="text-sm text-[#636e72]">Received</p>
                <p className="text-xl font-bold">{formatCurrency(90000)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f8f9fa] dark:hover:bg-[#2d3436] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      tx.type === "CREDIT" ? "bg-[#00b894]/10" : "bg-[#d63031]/10"
                    }`}>
                      {tx.type === "CREDIT" ? (
                        <ArrowDownRight className="h-5 w-5 text-[#00b894]" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-[#d63031]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-[#636e72]">{tx.counterparty} • {formatDate(tx.timestamp, "relative")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.type === "CREDIT" ? "text-[#00b894]" : ""}`}>
                      {tx.type === "CREDIT" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                    <Badge variant={tx.status === "COMPLETED" ? "success" : "warning"} className="text-[10px] px-1.5 py-0">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Send className="h-4 w-4 mr-3" />
              Send Money
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Wallet className="h-4 w-4 mr-3" />
              Request Money
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <CreditCard className="h-4 w-4 mr-3" />
              Apply for Card
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Plus className="h-4 w-4 mr-3" />
              Add Beneficiary
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
