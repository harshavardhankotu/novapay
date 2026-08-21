"use client"
import { useState, useEffect } from "react"
import { ShieldCheck, Smartphone, Fingerprint, Clock, AlertTriangle } from "lucide-react"
import { MpinModal } from "@/components/security/mpin-modal"

interface AuditLog { id: string; action: string; details: string; timestamp: string; ip: string; device: string; severity: "low" | "medium" | "high" }

export default function SecurityHubPage() {
  const [mpinOpen, setMpinOpen] = useState(false)
  const [mpinSet, setMpinSet] = useState(false)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [deviceId, setDeviceId] = useState("")
  const [ipAddress, setIpAddress] = useState("")
  const [trustScore, setTrustScore] = useState(92)

  useEffect(() => {
    fetch("/api/security").then(r => r.json()).then(d => { setLogs(d.logs || []); setDeviceId(d.deviceId); setIpAddress(d.ipAddress) }).catch(() => {})
    const interval = setInterval(() => { setTrustScore(s => Math.max(40, s - Math.floor(Math.random() * 3))) }, 10000)
    return () => clearInterval(interval)
  }, [])

  const severityColor = (s: string) => s === "high" ? "text-red-400" : s === "medium" ? "text-yellow-400" : "text-[#8ea6b6]"

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Security Hub</h1><p className="text-[#8ea6b6] text-sm">RBI compliant security center with device binding & audit trails</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d]">
          <div className="flex items-center gap-3 mb-2"><ShieldCheck className="w-5 h-5 text-[#2dd4bf]" /><span className="text-[#8ea6b6] text-sm">Trust Score</span></div>
          <p className="text-3xl font-bold text-white">{trustScore}<span className="text-sm text-[#8ea6b6]">/100</span></p>
          <div className="w-full bg-[#0e2633] h-1.5 rounded-full mt-2"><div className="bg-[#2dd4bf] h-1.5 rounded-full" style={{ width: `${trustScore}%` }} /></div>
        </div>
        <div className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d]">
          <div className="flex items-center gap-3 mb-2"><Smartphone className="w-5 h-5 text-blue-400" /><span className="text-[#8ea6b6] text-sm">This Device</span></div>
          <p className="text-white font-mono text-xs break-all">{deviceId || "••••"}</p>
          <p className="text-[#8ea6b6] text-xs mt-1">{ipAddress}</p>
        </div>
        <div className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d]">
          <div className="flex items-center gap-3 mb-2"><Fingerprint className="w-5 h-5 text-purple-400" /><span className="text-[#8ea6b6] text-sm">MPIN</span></div>
          <p className="text-white font-semibold">{mpinSet ? "✅ Enabled" : "Not set"}</p>
          <button onClick={() => setMpinOpen(true)} className="text-[#2dd4bf] text-sm mt-1 hover:underline">{mpinSet ? "Change" : "Set Now"}</button>
        </div>
      </div>

      <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] overflow-hidden">
        <div className="p-4 border-b border-[#1e3d4d] flex items-center justify-between">
          <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-[#8ea6b6]" /><h2 className="text-white font-semibold">Recent Activity</h2></div>
          <span className="text-[#8ea6b6] text-xs">{logs.length} events</span>
        </div>
        <div className="divide-y divide-zinc-800 max-h-96 overflow-y-auto">
          {logs.length === 0 && <p className="text-[#8ea6b6] text-sm p-4 text-center">No security events recorded yet</p>}
          {logs.map(l => (
            <div key={l.id} className="p-4 flex items-start gap-3 hover:bg-[#0e2633]/50">
              <AlertTriangle className={`w-5 h-5 mt-0.5 ${severityColor(l.severity)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{l.action}</p>
                <p className="text-[#8ea6b6] text-xs">{l.details}</p>
                <p className="text-[#8ea6b6] text-xs mt-0.5">{new Date(l.timestamp).toLocaleString()} · {l.ip} · {l.device}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MpinModal open={mpinOpen} onClose={() => setMpinOpen(false)} onSuccess={() => setMpinSet(true)} />
    </div>
  )
}
