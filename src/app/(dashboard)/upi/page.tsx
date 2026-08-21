"use client"
import { useState, useEffect } from "react"
import { Smartphone, Plus, QrCode, Copy, Check, Star } from "lucide-react"

export default function UpiPage() {
  const [upiIds, setUpiIds] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [copied, setCopied] = useState(false)
  const [showCreate, setShowCreate] = useState(false); const [accounts, setAccounts] = useState<any[]>([])
  const [form, setForm] = useState({ upiId: "", accountId: "", isPrimary: false })

  useEffect(() => {
    fetch("/api/upi-ids").then(r => r.json()).then(d => { setUpiIds(d); setLoading(false) }).catch(() => setLoading(false))
    fetch("/api/accounts").then(r => r.json()).then(d => setAccounts(d.accounts || d || [])).catch(() => {})
  }, [])

  const copyUpi = (id: string) => { navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const createUpi = async () => {
    if (!form.upiId || !form.accountId) return
    const res = await fetch("/api/upi-ids", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (res.ok) { const u = await res.json(); setUpiIds(prev => [...prev, u]); setShowCreate(false); setForm({ upiId: "", accountId: "", isPrimary: false }) }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">UPI</h1><p className="text-[#8ea6b6] text-sm">Manage UPI IDs · NPCI integration</p></div>
      <div className="flex items-center justify-between">
        <button onClick={() => setShowCreate(!showCreate)} className="bg-[#2dd4bf] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Create UPI ID</button>
        <button className="bg-[#0e2633] text-[#f3efe6] px-4 py-2 rounded-lg text-sm flex items-center gap-2"><QrCode className="w-4 h-4" /> Scan & Pay</button>
      </div>
      {showCreate && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-3">
          <input placeholder="yourname@novapay" value={form.upiId} onChange={e => setForm(f => ({ ...f, upiId: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <select value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]"><option value="">Link to account</option>{accounts.map((a: any) => <option key={a.id} value={a.id}>{a.accountNumber}</option>)}</select>
          <label className="flex items-center gap-2 text-[#8ea6b6] text-sm"><input type="checkbox" checked={form.isPrimary} onChange={e => setForm(f => ({ ...f, isPrimary: e.target.checked }))} className="accent-[#2dd4bf]" /> Set as primary</label>
          <button onClick={createUpi} className="w-full bg-[#2dd4bf] hover:bg-[#14a390] text-white rounded-lg py-2.5 text-sm font-medium">Create</button>
        </div>
      )}
      {loading ? <div className="text-center text-[#8ea6b6] py-8">Loading...</div> :
        upiIds.length === 0 ? <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]"><Smartphone className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" /><p className="text-[#8ea6b6]">No UPI IDs created</p></div> :
        upiIds.map(u => (
          <div key={u.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] flex items-center justify-between">
            <div className="flex items-center gap-3"><Smartphone className="w-5 h-5 text-[#2dd4bf]" /><div><p className="text-white font-medium">{u.upiId}</p><p className="text-[#8ea6b6] text-xs">{u.account?.accountNumber} ({u.account?.ifsc})</p></div></div>
            <div className="flex items-center gap-2">
              {u.isPrimary && <Star className="w-4 h-4 text-yellow-400" />}
              <button onClick={() => copyUpi(u.upiId)} className="text-[#8ea6b6] hover:text-white p-1.5">{copied ? <Check className="w-4 h-4 text-[#2dd4bf]" /> : <Copy className="w-4 h-4" />}</button>
            </div>
          </div>
        ))}
    </div>
  )
}
