"use client"
import { useState, useEffect } from "react"
import { ShieldCheck, Smartphone, KeyRound, AlertTriangle } from "lucide-react"

export default function TwoFactorPage() {
  const [tfa, setTfa] = useState<any>(null); const [loading, setLoading] = useState(true); const [enabling, setEnabling] = useState(false)

  useEffect(() => {
    fetch("/api/two-factor-auth").then(r => r.json()).then(d => { setTfa(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const toggle = async () => {
    setEnabling(true)
    const newState = !tfa?.enabled
    const res = await fetch("/api/two-factor-auth", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: newState }) })
    if (res.ok) { const d = await res.json(); setTfa(d) }
    setEnabling(false)
  }

  if (loading) return <div className="max-w-2xl mx-auto p-6 text-center text-[#8ea6b6]">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Two-Factor Authentication</h1><p className="text-[#8ea6b6] text-sm">Add an extra layer of security to your account</p></div>
      <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3"><ShieldCheck className="w-6 h-6 text-[#2dd4bf]" /><div><p className="text-white font-medium">Authenticator App</p><p className="text-[#8ea6b6] text-xs">TOTP via Google Authenticator, Authy, etc.</p></div></div>
          <button onClick={toggle} disabled={enabling} className={`relative w-12 h-6 rounded-full transition ${tfa?.enabled ? "bg-[#2dd4bf]" : "bg-[#0e2633]"}`}>
            <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition ${tfa?.enabled ? "left-6" : "left-0.5"}`} />
          </button>
        </div>
        {tfa?.enabled && (
          <div className="bg-[#0e2633]/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#2dd4bf]"><Smartphone className="w-4 h-4" /><span className="text-sm font-medium">2FA is active</span></div>
            <p className="text-[#8ea6b6] text-xs">Method: {tfa.method} · Backup codes available in settings</p>
          </div>
        )}
      </div>
      <div className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
        <p className="text-[#8ea6b6] text-sm">2FA protects your account even if your password is compromised. We recommend all users enable this.</p>
      </div>
    </div>
  )
}
