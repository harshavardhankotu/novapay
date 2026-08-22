"use client"
import { useState } from "react"

export default function IvrPage() {
  const [log, setLog] = useState<string[]>([
    "📞 Simulated missed-call banking (*99#/toll-free style). No telephony — this is a text state machine.",
  ])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)

  async function send(v?: string) {
    const val = v ?? input
    if (!val) return
    setLog(l => [...l, `You: ${val}`])
    setBusy(true)
    try {
      const r = await fetch("/api/ivr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: "ivr-demo", input: val }) })
      const d = await r.json()
      setLog(l => [...l, `Bank: ${d.reply || d.error}`])
    } catch { setLog(l => [...l, "Bank: Connection failed."]) }
    finally { setBusy(false); setInput("") }
  }

  return (
    <div className="max-w-lg mx-auto p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">📞 Missed-Call Banking</h1>
      <p className="text-[#8ea6b6] text-sm">
        SIMULATION of the low-tech phone-banking pattern Indian banks offer for financial inclusion.
        No real calls — a faithful text state machine instead.
      </p>

      <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-4 min-h-[280px] max-h-[400px] overflow-y-auto font-mono text-xs space-y-1.5">
        {log.map((line, i) => (
          <p key={i} className={line.startsWith("You:") ? "text-[#2dd4bf]" : line.startsWith("Bank:") ? "text-[#f2bd68]" : "text-[#8ea6b6]"}>{line}</p>
        ))}
        {busy && <p className="text-[#8ea6b6]">…connecting</p>}
      </div>

      <div className="flex gap-2 flex-wrap">
        {[["1", "Balance"], ["2", "Mini stmt"], ["3", "Block cards"], ["0", "Menu"]].map(([v, label]) => (
          <button key={v} onClick={() => send(v)} disabled={busy}
            className="px-3 py-1.5 rounded-lg bg-[#0e2633] border border-[#1e3d4d] text-xs text-white hover:border-[#e8a33d]/40 disabled:opacity-50">
            {v} · {label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Or type an option…" className="flex-1 bg-[#071a26] border border-[#1e3d4d] rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#e8a33d]/50 focus:outline-none" />
        <ButtonLike onClick={() => send()} disabled={busy}>Send</ButtonLike>
      </div>
    </div>
  )
}

function ButtonLike({ children, onClick, disabled }: any) {
  return <button onClick={onClick} disabled={disabled} className="bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] hover:from-[#d18a24] hover:to-[#e0a64a] text-[#1a1206] px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">{children}</button>
}