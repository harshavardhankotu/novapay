"use client"
import { useState, useEffect } from "react"
import { CreditCard, Plus, Star } from "lucide-react"

export default function SavedCardsPage() {
  const [cards, setCards] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ cardNumber: "", cardNetwork: "VISA", lastFour: "", expiryMonth: "12", expiryYear: "28", cardholder: "", nickname: "" })

  useEffect(() => {
    fetch("/api/saved-cards").then(r => r.json()).then(d => { setCards(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const add = async () => {
    if (!form.cardNumber || !form.lastFour) return
    const res = await fetch("/api/saved-cards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, expiryMonth: parseInt(form.expiryMonth), expiryYear: parseInt(form.expiryYear) }) })
    if (res.ok) { const c = await res.json(); setCards(prev => [...prev, c]); setShowAdd(false); setForm({ cardNumber: "", cardNetwork: "VISA", lastFour: "", expiryMonth: "12", expiryYear: "28", cardholder: "", nickname: "" }) }
  }

  const setDefault = async (id: string) => {
    const res = await fetch("/api/saved-cards", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isDefault: true }) })
    if (res.ok) setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })))
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Saved Cards</h1><p className="text-[#8ea6b6] text-sm">Quick checkout with saved cards</p></div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-[#2dd4bf] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Add Card</button>
      </div>
      {showAdd && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] grid grid-cols-2 gap-3">
          <input placeholder="Card number" value={form.cardNumber} onChange={e => setForm(f => ({ ...f, cardNumber: e.target.value }))} className="col-span-2 bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <input placeholder="Last 4 digits" value={form.lastFour} onChange={e => setForm(f => ({ ...f, lastFour: e.target.value }))} className="bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <input placeholder="Cardholder name" value={form.cardholder} onChange={e => setForm(f => ({ ...f, cardholder: e.target.value }))} className="bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <div className="flex gap-2 col-span-2">{["VISA","MASTERCARD","RUPAY"].map(n => <button key={n} onClick={() => setForm(f => ({ ...f, cardNetwork: n }))} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${form.cardNetwork === n ? "bg-[#2dd4bf] text-white" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{n}</button>)}</div>
          <button onClick={add} className="col-span-2 bg-[#2dd4bf] hover:bg-[#14a390] text-white rounded-lg py-2.5 text-sm font-medium">Save Card</button>
        </div>
      )}
      {loading ? <div className="text-center text-[#8ea6b6] py-8">Loading...</div> :
        cards.length === 0 ? <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]"><CreditCard className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" /><p className="text-[#8ea6b6]">No saved cards</p></div> :
        cards.map(c => (
          <div key={c.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-[#8ea6b6]" />
              <div><p className="text-white font-medium">{c.nickname || `${c.cardNetwork} •••• ${c.lastFour}`}</p><p className="text-[#8ea6b6] text-xs">{c.cardholder} · Exp {c.expiryMonth}/{c.expiryYear}</p></div>
            </div>
            <div className="flex items-center gap-2">
              {c.isDefault ? <Star className="w-4 h-4 text-yellow-400" /> : <button onClick={() => setDefault(c.id)} className="text-[#8ea6b6] text-xs hover:text-white">Set default</button>}
            </div>
          </div>
        ))}
    </div>
  )
}
