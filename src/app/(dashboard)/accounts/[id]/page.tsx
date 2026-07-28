"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Copy, ExternalLink } from "lucide-react"

type AccountDetail = {
  id: string; type: string; balance: number; currency: string
  accountNumber: string; ifsc: string; upiHandle: string | null; isActive: boolean
  transactions: { id: string; type: string; amount: number; description: string; timestamp: string; status: string }[]
}

export default function AccountDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [account, setAccount] = useState<AccountDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/accounts`).then(r => r.json()).then((accounts: AccountDetail[]) => {
      const acc = accounts.find((a) => a.id === params.id)
      if (acc) {
        setAccount(acc)
        if (acc.transactions) setAccount({ ...acc, transactions: acc.transactions })
      }
      setLoading(false)
    })
  }, [params.id])

  if (loading) return <div className="animate-pulse p-6 space-y-4"><div className="h-8 w-48 rounded-xl bg-[#e8eaed] dark:bg-[#2a2a45]" /><div className="h-32 rounded-2xl bg-[#e8eaed] dark:bg-[#2a2a45]" /></div>
  if (!account) return <div className="p-6 text-center text-[#636e72]">Account not found</div>

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[#636e72] hover:text-[#1a1a2e] dark:hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-[#636e72]">{account.type} Account</p>
            <h1 className="text-3xl font-bold mt-1">{formatCurrency(account.balance, account.currency)}</h1>
          </div>
          <Badge variant={account.isActive ? "success" : "secondary"}>{account.isActive ? "Active" : "Inactive"}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 bg-[#f8f9fc] dark:bg-[#1a1a30] rounded-xl p-4 text-sm">
          <div><span className="text-[#636e72]">Account No.</span><p className="font-mono font-medium">{account.accountNumber}</p></div>
          <div><span className="text-[#636e72]">IFSC</span><p className="font-mono font-medium">{account.ifsc}</p></div>
          {account.upiHandle && <div><span className="text-[#636e72]">UPI Handle</span><p className="font-mono font-medium">{account.upiHandle}</p></div>}
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5"><ArrowUpRight className="h-4 w-4" /> Send</Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1.5"><ArrowDownRight className="h-4 w-4" /> Receive</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Recent Transactions</h2>
        <div className="space-y-1">
          {account.transactions?.length > 0 ? account.transactions.map((tx: any) => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f8f9fc] dark:hover:bg-[#1a1a30]">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${tx.type === "CREDIT" ? "bg-[#00b894]/10" : "bg-[#e17055]/10"}`}>
                  {tx.type === "CREDIT" ? <ArrowDownRight className="h-4 w-4 text-[#00b894]" /> : <ArrowUpRight className="h-4 w-4 text-[#e17055]" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-[#636e72]">{formatDate(tx.timestamp, "relative")}</p>
                </div>
              </div>
              <p className={`text-sm font-semibold ${tx.type === "CREDIT" ? "text-[#00b894]" : ""}`}>
                {tx.type === "CREDIT" ? "+" : "-"}{formatCurrency(tx.amount, account.currency)}
              </p>
            </div>
          )) : <p className="text-sm text-[#636e72] text-center py-4">No transactions yet</p>}
        </div>
      </div>
    </div>
  )
}
