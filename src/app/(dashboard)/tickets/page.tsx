"use client"
import { useState, useEffect } from "react"
import { LifeBuoy, Plus, MessageCircle } from "lucide-react"

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ subject: "", category: "GENERAL", message: "" })

  useEffect(() => {
    fetch("/api/support").then(r => r.json()).then(d => { setTickets(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const create = async () => {
    if (!form.subject || !form.message) return
    const res = await fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (res.ok) { const t = await res.json(); setTickets(prev => [t, ...prev]); setShowCreate(false); setForm({ subject: "", category: "GENERAL", message: "" }) }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Support Tickets</h1><p className="text-[#8ea6b6] text-sm">Get help from our support team</p></div>
        <button onClick={() => setShowCreate(!showCreate)} className="bg-[#2dd4bf] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> New Ticket</button>
      </div>
      {showCreate && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-3">
          <input placeholder="Subject" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <div className="flex gap-2">{["GENERAL","ACCOUNT","TRANSACTION","CARD","TECHNICAL","FRAUD"].map(c => <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${form.category === c ? "bg-[#2dd4bf] text-white" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{c}</button>)}</div>
          <textarea placeholder="Describe your issue..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <button onClick={create} className="w-full bg-[#2dd4bf] hover:bg-[#14a390] text-white rounded-lg py-2.5 text-sm font-medium">Submit Ticket</button>
        </div>
      )}
      {loading ? <div className="text-center text-[#8ea6b6] py-8">Loading...</div> :
        tickets.length === 0 ? <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]"><LifeBuoy className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" /><p className="text-[#8ea6b6]">No tickets</p></div> :
        tickets.map(t => (
          <div key={t.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d]">
            <div className="flex items-center justify-between mb-2"><span className="text-white font-medium">{t.subject}</span><span className={`text-xs px-2 py-0.5 rounded-full ${t.status === "OPEN" ? "bg-green-900/50 text-green-400" : t.status === "IN_PROGRESS" ? "bg-yellow-900/50 text-yellow-400" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{t.status}</span></div>
            <p className="text-[#8ea6b6] text-xs">{t.category} · Created {new Date(t.createdAt).toLocaleDateString()}</p>
            {t.messages?.length > 0 && <div className="mt-2 bg-[#0e2633]/50 rounded-lg p-3"><MessageCircle className="w-3 h-3 inline text-[#8ea6b6] mr-1" /><span className="text-[#8ea6b6] text-xs">{t.messages.length} messages</span></div>}
          </div>
        ))}
    </div>
  )
}
