"use client"
import { useState, useEffect } from "react"
import { Users, Plus } from "lucide-react"

export default function KidsPage() {
  const [kids, setKids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", age: "10", allowance: "500" })

  useEffect(() => {
    fetch("/api/kids").then(r => r.json()).then(d => { setKids(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const addKid = async () => {
    if (!form.name) return
    const res = await fetch("/api/kids", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, age: parseInt(form.age), weeklyAllowance: parseInt(form.allowance) }),
    })
    if (res.ok) { const k = await res.json(); setKids(prev => [...prev, k]); setShowForm(false); setForm({ name: "", age: "10", allowance: "500" }) }
  }

  const toggleFreeze = async (kid: any) => {
    const action = kid.cardStatus === "FROZEN" ? "unfreeze" : "freeze"
    const res = await fetch("/api/kids", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: kid.id, action }),
    })
    if (res.ok) setKids(prev => prev.map(k => k.id === kid.id ? { ...k, cardStatus: action === "freeze" ? "FROZEN" : "ACTIVE" } : k))
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Kids</h1><p className="text-[#8ea6b6] text-sm">Manage children accounts · Parental controls</p></div>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#2dd4bf] hover:bg-[#14a390] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Child
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-3">
          <input placeholder="Child's name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:outline-none focus:border-[#2dd4bf]" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Age" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:outline-none focus:border-[#2dd4bf]" />
            <input type="number" placeholder="Weekly allowance (₹)" value={form.allowance} onChange={e => setForm(f => ({ ...f, allowance: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:outline-none focus:border-[#2dd4bf]" />
          </div>
          <button onClick={addKid} className="w-full bg-[#2dd4bf] hover:bg-[#14a390] text-white rounded-lg py-2.5 text-sm font-medium">Create Account</button>
        </div>
      )}

      {loading ? (
        <div className="text-[#8ea6b6] text-center py-8">Loading...</div>
      ) : kids.length === 0 ? (
        <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]">
          <Users className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" />
          <p className="text-[#8ea6b6]">No kids accounts yet</p>
          <p className="text-[#8ea6b6] text-sm mt-1">Create accounts with parental controls and weekly allowances</p>
        </div>
      ) : (
        kids.map(k => (
          <div key={k.id} className="bg-[#0e2633] rounded-2xl p-5 border border-[#1e3d4d]">
            <div className="flex items-center justify-between mb-3">
              <div><p className="text-white font-semibold text-lg">{k.name}</p><p className="text-[#8ea6b6] text-sm">Age {k.age} · Card: {k.cardStatus || "ACTIVE"}</p></div>
              <button onClick={() => toggleFreeze(k)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${k.cardStatus === "FROZEN" ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}>{k.cardStatus === "FROZEN" ? "Unfreeze" : "Freeze"}</button>
            </div>
            <div className="flex gap-4 text-sm">
              <div><span className="text-[#8ea6b6]">Balance</span><p className="text-white font-medium">₹{k.balance?.toLocaleString("en-IN") || 0}</p></div>
              <div><span className="text-[#8ea6b6]">Allowance</span><p className="text-white font-medium">₹{k.weeklyAllowance}/wk</p></div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
