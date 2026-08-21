"use client"
import { useState, useEffect } from "react"
import { ShieldAlert } from "lucide-react"

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ merchant: "", amount: "", reason: "" })

  useEffect(() => {
    fetch("/api/disputes").then(r => r.json()).then(d => { setDisputes(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const submitDispute = async () => {
    if (!form.merchant || !form.amount || !form.reason) return
    const res = await fetch("/api/disputes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchant: form.merchant, amount: parseFloat(form.amount), reason: form.reason }),
    })
    if (res.ok) { const d = await res.json(); setDisputes(prev => [d, ...prev]); setShowForm(false); setForm({ merchant: "", amount: "", reason: "" }) }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Disputes</h1><p className="text-[#8ea6b6] text-sm">RBI Ombudsman · NPCI chargeback enabled</p></div>
        <button onClick={() => setShowForm(!showForm)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Raise Dispute</button>
      </div>

      {showForm && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-3">
          <input placeholder="Merchant name" value={form.merchant} onChange={e => setForm(f => ({ ...f, merchant: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:outline-none focus:border-[#2dd4bf]" />
          <input type="number" placeholder="Amount (₹)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:outline-none focus:border-[#2dd4bf]" />
          <textarea placeholder="Reason for dispute" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:outline-none focus:border-[#2dd4bf]" />
          <button onClick={submitDispute} className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg py-2.5 text-sm font-medium">Submit to NPCI</button>
        </div>
      )}

      {loading ? (
        <div className="bg-[#0e2633] rounded-2xl p-8 text-center text-[#8ea6b6] border border-[#1e3d4d]">Loading...</div>
      ) : disputes.length === 0 ? (
        <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]">
          <ShieldAlert className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" />
          <p className="text-[#8ea6b6]">No disputes filed</p>
          <p className="text-[#8ea6b6] text-sm mt-1">Dispute any transaction directly with NPCI</p>
        </div>
      ) : (
        disputes.map(d => (
          <div key={d.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] flex items-center justify-between hover:border-[#1e3d4d]">
            <div>
              <p className="text-white font-medium">{d.merchant}</p>
              <p className="text-[#8ea6b6] text-xs">{d.reason} · Ref: {d.npciRef}</p>
              <p className="text-[#8ea6b6] text-xs mt-0.5">{new Date(d.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-red-400 font-semibold">₹{d.amount.toLocaleString("en-IN")}</p>
              <span className="bg-yellow-900/50 text-yellow-400 text-xs px-2 py-0.5 rounded-full">{d.status || "PENDING"}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
