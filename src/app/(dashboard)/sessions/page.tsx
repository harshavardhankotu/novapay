"use client"
import { useState, useEffect } from "react"
import { Monitor, Smartphone, Globe, Trash2, ShieldCheck } from "lucide-react"

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]); const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/sessions").then(r => r.json()).then(d => { setSessions(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const revoke = async (id: string) => {
    const res = await fetch("/api/sessions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    if (res.ok) setSessions(prev => prev.filter(s => s.id !== id))
  }

  const deviceIcon = (ua: string) => ua?.toLowerCase().includes("mobile") || ua?.toLowerCase().includes("iphone") ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-[#2dd4bf]" /><div><h1 className="text-2xl font-bold text-white">Active Sessions</h1><p className="text-[#8ea6b6] text-sm">Manage devices where you are logged in</p></div></div>
      {loading ? <div className="text-center text-[#8ea6b6] py-8">Loading...</div> :
        sessions.length === 0 ? <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]"><Monitor className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" /><p className="text-[#8ea6b6]">No active sessions</p></div> :
        sessions.map(s => (
          <div key={s.id} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0e2633] flex items-center justify-center text-[#8ea6b6]">{deviceIcon(s.userAgent)}</div>
              <div><p className="text-white font-medium">{s.device || "Unknown device"}</p><p className="text-[#8ea6b6] text-xs">IP: {s.ip} · Last active: {new Date(s.lastUsed).toLocaleString()}</p></div>
            </div>
            <button onClick={() => revoke(s.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
    </div>
  )
}
