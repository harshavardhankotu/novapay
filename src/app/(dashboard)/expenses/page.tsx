"use client"
import { useState, useEffect } from "react"
import { Split, Plus, CheckCircle } from "lucide-react"

export default function ExpensesPage() {
  const [splits, setSplits] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: "", totalAmount: "", splitWith: "", dueDate: "" })

  useEffect(() => {
    fetch("/api/expense-splits").then(r => r.json()).then(d => { setSplits(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const create = async () => {
    if (!form.title || !form.totalAmount || !form.splitWith) return
    const res = await fetch("/api/expense-splits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, totalAmount: parseFloat(form.totalAmount) }) })
    if (res.ok) { const s = await res.json(); setSplits(prev => [s, ...prev]); setShowCreate(false); setForm({ title: "", totalAmount: "", splitWith: "", dueDate: "" }) }
  }

  const settle = async (id: string) => {
    const res = await fetch("/api/expense-splits", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    if (res.ok) setSplits(prev => prev.map(s => s.id === id ? { ...s, settled: true } : s))
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Split Expenses</h1><p className="text-[#8ea6b6] text-sm">Share bills with friends</p></div>
        <button onClick={() => setShowCreate(!showCreate)} className="bg-[#2dd4bf] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> New Split</button>
      </div>
      {showCreate && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-3">
          <input placeholder="What for?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <input type="number" placeholder="Total amount (₹)" value={form.totalAmount} onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <input placeholder="Split with (name/number)" value={form.splitWith} onChange={e => setForm(f => ({ ...f, splitWith: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <button onClick={create} className="w-full bg-[#2dd4bf] hover:bg-[#14a390] text-white rounded-lg py-2.5 text-sm font-medium">Create Split</button>
        </div>
      )}
      {loading ? <div className="text-center text-[#8ea6b6] py-8">Loading...</div> :
        splits.length === 0 ? <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]"><Split className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" /><p className="text-[#8ea6b6]">No splits</p></div> :
        splits.map(s => {
          const share = s.splitWith ? s.totalAmount / 2 : s.totalAmount
          return <div key={s.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] flex items-center justify-between">
            <div><p className="text-white font-medium">{s.title}</p><p className="text-[#8ea6b6] text-xs">With {s.splitWith} · ₹{share} each</p><p className="text-[#8ea6b6] text-xs">Due {new Date(s.dueDate).toLocaleDateString()}</p></div>
            <div className="flex items-center gap-2">{s.settled ? <span className="text-[#2dd4bf] text-xs flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Settled</span> : <button onClick={() => settle(s.id)} className="bg-[#0e2633] text-[#f3efe6] px-3 py-1.5 rounded-lg text-xs">Mark Settled</button>}</div>
          </div>
        })}
    </div>
  )
}
