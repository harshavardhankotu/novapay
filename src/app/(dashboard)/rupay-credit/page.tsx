"use client"
import { useState, useEffect } from "react"
import { CreditCard, Info, CheckCircle } from "lucide-react"

export default function RuPayCreditPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showKfs, setShowKfs] = useState(false)

  useEffect(() => {
    fetch("/api/rupay-credit").then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="max-w-2xl mx-auto p-6 text-[#8ea6b6] text-center">Loading...</div>
  if (!data) return null

  const pctUsed = data.totalLimit > 0 ? (data.usedLimit / data.totalLimit) * 100 : 0

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">RuPay Credit Line</h1><p className="text-[#8ea6b6] text-sm">UPI credit on RuPay · Interest-free up to {data.interestFreeDays} days</p></div>

      <div className="bg-gradient-to-r from-indigo-900/40 to-zinc-900 rounded-2xl p-6 border border-[#1e3d4d]">
        <div className="flex items-center gap-3 mb-3"><CreditCard className="w-6 h-6 text-indigo-400" /><p className="text-white font-semibold">Credit Limit</p></div>
        <p className="text-3xl font-bold text-white">₹{data.availableLimit?.toLocaleString("en-IN") || 0}</p>
        <p className="text-[#8ea6b6] text-sm">Available</p>
        <div className="w-full bg-[#0e2633] h-2 rounded-full mt-3"><div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${pctUsed}%` }} /></div>
        <p className="text-[#8ea6b6] text-xs mt-1">₹{data.usedLimit?.toLocaleString("en-IN") || 0} of ₹{data.totalLimit?.toLocaleString("en-IN") || 0} used</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d]">
          <p className="text-[#8ea6b6] text-xs">Interest-free Period</p>
          <p className="text-white text-lg font-bold">{data.interestFreeDays} days</p>
        </div>
        <div className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d]">
          <p className="text-[#8ea6b6] text-xs">Next Due Date</p>
          <p className="text-white text-lg font-bold">{new Date(data.dueDate).toLocaleDateString("en-IN")}</p>
        </div>
      </div>

      <div className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] flex items-center justify-between cursor-pointer hover:bg-[#0e2633]" onClick={() => setShowKfs(!showKfs)}>
        <div className="flex items-center gap-2"><Info className="w-5 h-5 text-[#8ea6b6]" /><span className="text-white text-sm font-medium">Key Fact Statement (KFS)</span></div>
        <span className="text-[#8ea6b6]">{showKfs ? "▲" : "▼"}</span>
      </div>
      {showKfs && (
        <div className="bg-[#0e2633] rounded-2xl p-5 border border-[#1e3d4d] space-y-3 text-sm">
          <div className="flex justify-between text-[#8ea6b6]"><span>Interest Rate</span><span className="text-white">1.5% per month (18% APR)</span></div>
          <div className="flex justify-between text-[#8ea6b6]"><span>Processing Fee</span><span className="text-white">₹99 + GST</span></div>
          <div className="flex justify-between text-[#8ea6b6]"><span>Late Payment Fee</span><span className="text-red-400">₹100 or 3% (whichever higher)</span></div>
          <div className="flex justify-between text-[#8ea6b6]"><span>Forex Markup</span><span className="text-white">1.5% over RBI rate</span></div>
          <div className="flex justify-between text-[#8ea6b6]"><span>Prepayment</span><span className="text-[#2dd4bf]">No charges</span></div>
          <div className="flex justify-between text-[#8ea6b6]"><span>UPI Enabled</span><span className="text-[#2dd4bf]">{data.upiEnabled ? "Yes" : "No"}</span></div>
          <div className="pt-2 border-t border-[#1e3d4d] flex items-center gap-2 text-[#2dd4bf]"><CheckCircle className="w-5 h-5" />RBI-compliant · No hidden charges</div>
        </div>
      )}
    </div>
  )
}
