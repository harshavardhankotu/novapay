"use client"
import { useCallback, useEffect, useState } from "react"
import { Loader2, ArrowDownToLine, ArrowUpFromLine, Users, Info } from "lucide-react"

interface WalletData {
  balance: number
  tokenCount: number
  txns: { id: string; kind: string; amount: number; createdAt: string; counterparty?: string }[]
}

const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`

export default function CbdcPage() {
  const [w, setW] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState("")
  const [toEmail, setToEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const load = useCallback(() => {
    fetch("/api/cbdc").then(r => r.json()).then(setW).catch(() => {}).finally(() => setLoading(false))
  }, [])
  useEffect(load, [load])

  async function act(action: "load" | "redeem" | "p2p") {
    setBusy(true); setMsg(null)
    try {
      const res = await fetch("/api/cbdc", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, amount: parseInt(amount), toEmail: toEmail || undefined }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setMsg({ ok: true, text: `${action === "load" ? "Loaded" : action === "redeem" ? "Redeemed" : "Sent"} ₹${amount}` })
      setAmount(""); load()
    } catch (e: any) { setMsg({ ok: false, text: e?.message || "Failed" }) }
    finally { setBusy(false) }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-5">
      <h1 className="text-2xl font-bold text-white">Digital Rupee (e₹) Wallet</h1>

      <div className="bg-[#0e2633]/60 border border-[#1e3d4d] rounded-2xl p-4 text-sm text-[#c9d4de] space-y-1.5">
        <p className="flex items-start gap-2"><Info className="w-4 h-4 mt-0.5 shrink-0 text-[#2dd4bf]" />
          e₹ is <strong>token-based</strong> money issued by RBI — each unit is a discrete digital token with a serial, unlike the <strong>account-based</strong> UPI/bank ledger where balances are entries in a register. Your wallet below holds individual tokens; loading converts bank money to tokens, redeeming burns them back.</p>
        <p className="text-[11px] text-[#8ea6b6]">SIMULATION — models RBI&apos;s CBDC pilot mechanics; no real central-bank money moves.</p>
      </div>

      {loading ? <Loader2 className="animate-spin mx-auto my-10 text-[#e8a33d]" /> : (
        <>
          <div className="rounded-2xl bg-gradient-to-br from-[#062c3a] via-[#0a3a4d] to-[#071a26] border border-[#2dd4bf]/20 p-6">
            <p className="text-xs text-white/50">Wallet balance (token value)</p>
            <p className="text-3xl font-bold text-white mt-1">₹{(w?.balance ?? 0).toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-white/40 mt-1">{w?.tokenCount ?? 0} discrete token(s)</p>
          </div>

          {msg && <div className={`p-3 rounded-xl border text-sm ${msg.ok ? "bg-[#4ade80]/10 border-[#4ade80]/30 text-[#4ade80]" : "bg-[#f87171]/10 border-[#f87171]/30 text-[#f87171]"}`}>{msg.text}</div>}

          <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-5 space-y-3">
            <input type="number" min={1} placeholder="Whole rupee amount" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full bg-[#071a26] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:border-[#e8a33d]/50 focus:outline-none" />
            <input placeholder="Recipient email (for P2P)" value={toEmail} onChange={e => setToEmail(e.target.value)}
              className="w-full bg-[#071a26] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d] focus:border-[#e8a33d]/50 focus:outline-none" />
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => act("load")} disabled={busy || !amount} className="flex items-center justify-center gap-1.5 bg-[#2dd4bf] hover:bg-[#14a390] text-[#04241f] py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"><ArrowDownToLine className="w-4 h-4" /> Load</button>
              <button onClick={() => act("redeem")} disabled={busy || !amount} className="flex items-center justify-center gap-1.5 bg-[#0e2633] border border-[#1e3d4d] text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"><ArrowUpFromLine className="w-4 h-4" /> Redeem</button>
              <button onClick={() => act("p2p")} disabled={busy || !amount || !toEmail} className="flex items-center justify-center gap-1.5 bg-[#0e2633] border border-[#1e3d4d] text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"><Users className="w-4 h-4" /> P2P Send</button>
            </div>
          </div>

          <div className="space-y-1.5">
            {(w?.txns ?? []).map(t => (
              <div key={t.id} className="flex items-center justify-between text-xs bg-[#0e2633]/40 rounded-lg px-3 py-2 border border-[#1e3d4d]/60">
                <span className="text-white">{t.kind.replace("_", " ")}</span>
                <span className={t.kind === "LOAD" || t.kind === "P2P_IN" ? "text-[#4ade80]" : "text-[#f87171]"}>{t.kind.startsWith("P2P_IN") || t.kind === "LOAD" ? "+" : "−"}{money(t.amount)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}