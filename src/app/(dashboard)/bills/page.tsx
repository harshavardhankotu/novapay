"use client"
import { useState, useEffect } from "react"
import { Zap, Droplets, Flame, Smartphone, Tv, Wifi, CreditCard, Plus, RefreshCw } from "lucide-react"

const catIcons: Record<string, any> = { ELECTRICITY: Zap, WATER: Droplets, GAS: Flame, MOBILE: Smartphone, DTH: Tv, BROADBAND: Wifi, CREDIT_CARD: CreditCard, INSURANCE: Shield, FASTAG: CreditCard, LOAN: CreditCard }

import { Shield } from "lucide-react"

export default function BillsPage() {
  const [billers, setBillers] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [showAdd, setShowAdd] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [form, setForm] = useState({ category: "ELECTRICITY", name: "", consumerNo: "", nickname: "" })

  useEffect(() => {
    fetch("/api/billers").then(r => r.json()).then((d: any[]) => { setBillers(d); const cats = [...new Set(d.map(b => b.category))] as string[]; setCategories(cats); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const addBiller = async () => {
    if (!form.name || !form.consumerNo) return
    const res = await fetch("/api/billers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (res.ok) { const b = await res.json(); setBillers(prev => [...prev, b]); setShowAdd(false); setForm({ category: "ELECTRICITY", name: "", consumerNo: "", nickname: "" }) }
  }

  const payBill = async (billerId: string, amount: number) => {
    await fetch("/api/bill-payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ billerId, amount }) })
    setBillers(prev => prev.map(b => b.id === billerId ? { ...b, billPayments: [...(b.billPayments || []), { amount, paidAt: new Date().toISOString(), status: "COMPLETED" }] } : b))
  }

  const catLabels: Record<string, string> = { ELECTRICITY: "Electricity", WATER: "Water", GAS: "Gas", MOBILE: "Mobile", DTH: "DTH", BROADBAND: "Broadband", CREDIT_CARD: "Credit Card Bill", INSURANCE: "Insurance", FASTAG: "FASTag", LOAN: "Loan Repayment" }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Bill Payments</h1><p className="text-[#8ea6b6] text-sm">Pay bills, set auto-pay, manage all billers</p></div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-[#2dd4bf] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Add Biller</button>
      </div>
      {showAdd && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-3">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(catLabels).slice(0, 8).map(([k, v]) => (
              <button key={k} onClick={() => setForm(f => ({ ...f, category: k }))} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${form.category === k ? "bg-[#2dd4bf] text-white" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{v}</button>
            ))}
          </div>
          <input placeholder="Biller name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <input placeholder="Consumer / Account number" value={form.consumerNo} onChange={e => setForm(f => ({ ...f, consumerNo: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <input placeholder="Nickname (optional)" value={form.nickname} onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <button onClick={addBiller} className="w-full bg-[#2dd4bf] hover:bg-[#14a390] text-white rounded-lg py-2.5 text-sm font-medium">Add Biller</button>
        </div>
      )}
      {loading ? <div className="text-center text-[#8ea6b6] py-8">Loading...</div> :
        billers.length === 0 ? <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]"><CreditCard className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" /><p className="text-[#8ea6b6]">No billers added</p></div> :
        billers.map(b => {
          const Icon = catIcons[b.category] || CreditCard
          return <div key={b.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3"><Icon className="w-5 h-5 text-[#2dd4bf]" /><div><p className="text-white font-medium">{b.nickname || b.name}</p><p className="text-[#8ea6b6] text-xs">{catLabels[b.category]} · {b.consumerNo}</p></div></div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${b.autoPay ? "bg-[#2dd4bf]/20 text-[#2dd4bf]" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{b.autoPay ? "Auto" : "Manual"}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => payBill(b.id, Math.floor(Math.random() * 5000 + 500))} className="bg-[#2dd4bf] text-white px-3 py-1.5 rounded-lg text-xs font-medium">Pay Now</button>
              <button className="text-[#8ea6b6] text-xs border border-[#1e3d4d] px-3 py-1.5 rounded-lg">View History</button>
            </div>
            {b.billPayments?.length > 0 && <p className="text-[#8ea6b6] text-xs mt-2">Last: ₹{b.billPayments[0].amount} on {new Date(b.billPayments[0].paidAt).toLocaleDateString()}</p>}
          </div>
        })}
    </div>
  )
}
