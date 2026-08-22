"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Snowflake, CreditCard, Loader2, AlertCircle, Zap, Globe, CheckCircle2, XCircle } from "lucide-react"

const MCC_LIST = ["GROCERY", "FUEL", "RESTAURANT", "TRAVEL", "ELECTRONICS", "ATM_CASH", "GAMBLING", "CRYPTO", "UTILITIES", "OTHER"]

interface CardRow {
  id: string
  type: string
  network: string
  lastFour: string
  expiryMonth: number
  expiryYear: number
  status: string
  dailyLimit: number
  monthlyLimit: number
}

const gradients: Record<string, string> = {
  VIRTUAL: "from-[#e8a33d] to-[#f2bd68]",
  PHYSICAL: "from-[#0e2633] to-[#285064]",
  METAL: "from-[#2dd4bf] to-[#0a3a4d]",
}

export default function CardsPage() {
  const [cards, setCards] = useState<CardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [issuing, setIssuing] = useState(false)
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    let alive = true
    fetch("/api/cards")
      .then((r) => r.json())
      .then((d: any) => {
        if (alive) setCards(Array.isArray(d?.cards) ? d.cards : Array.isArray(d) ? d : [])
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [reloadTick])

  async function patchCard(id: string, patch: Record<string, unknown>) {
    setError("")
    try {
      const res = await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      })
      if (!res.ok) throw new Error("Update failed")
      setCards(prev => prev.map(c => (c.id === id ? { ...c, ...(patch as any), status: patch.internationalEnabled !== undefined ? c.status : c.status } as CardRow : c)))
      if (patch.confirmDispatchAddress || patch.blockedMccCategories !== undefined) setReloadTick(t => t + 1)
    } catch (e: any) { setError(e?.message || "Failed") }
  }

  // Swipe simulator state
  const [swipe, setSwipe] = useState({ cardId: "", mccCategory: "GROCERY", amount: "", intl: false, channel: "POS" })
  const [swipeResult, setSwipeResult] = useState<{ ok: boolean; text: string } | null>(null)

  async function runSwipe() {
    if (!swipe.cardId || !swipe.amount) return
    setSwipeResult(null)
    try {
      const res = await fetch("/api/cards/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...swipe, amount: parseFloat(swipe.amount) }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      if (d.result === "APPROVED") {
        setSwipeResult({ ok: true, text: `APPROVED · ${Number(swipe.amount).toLocaleString("en-IN", { style: "currency", currency: "INR" })} at ${swipe.mccCategory}${swipe.intl ? " (international)" : ""}` })
      } else {
        setSwipeResult({ ok: false, text: `DECLINED — ${d.reason?.replace(/_/g, " ")}` })
      }
      setReloadTick(t => t + 1)
    } catch (e: any) { setSwipeResult({ ok: false, text: e?.message }) }
  }

  function money(n: number) { return `₹${Number(n || 0).toLocaleString("en-IN")}` }

  async function toggleFreeze(card: CardRow) {
    setBusyId(card.id)
    setError("")
    try {
      const res = await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: card.id, action: card.status === "FROZEN" ? "unfreeze" : "freeze" }),
      })
      if (!res.ok) throw new Error("Could not update card")
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, status: c.status === "FROZEN" ? "ACTIVE" : "FROZEN" } : c))
      )
    } catch (e: any) {
      setError(e?.message || "Failed")
    } finally {
      setBusyId(null)
    }
  }

  async function issueCard() {
    setIssuing(true)
    setError("")
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "VIRTUAL", network: "VISA" }),
      })
      if (!res.ok) throw new Error("Could not issue card")
      setLoading(true)
      setReloadTick((t) => t + 1)
    } catch (e: any) {
      setError(e?.message || "Failed")
    } finally {
      setIssuing(false)
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cards</h1>
          <p className="text-sm text-[#8ea6b6] mt-0.5">Manage virtual & physical cards</p>
        </div>
        <Button onClick={issueCard} disabled={issuing}>
          {issuing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Get New Card
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#f87171]/10 border border-[#f87171]/30 text-sm text-[#f87171]">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center"><Loader2 className="h-7 w-7 animate-spin mx-auto text-[#e8a33d]" /></div>
      ) : cards.length === 0 ? (
        <div className="rounded-2xl bg-[#0e2633] border border-[#1e3d4d] p-10 text-center">
          <CreditCard className="h-12 w-12 mx-auto text-[#8ea6b6] mb-3" />
          <p className="text-[#c9d4de]">No cards yet — issue your first virtual card.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {cards.map((card) => {
            const frozen = card.status === "FROZEN"
            return (
              <div key={card.id} className={`bg-[#0e2633] rounded-2xl border border-[#1e3d4d] shadow-sm overflow-hidden animate-slide-up ${frozen ? "opacity-75" : ""}`}>
                <div className={`bg-gradient-to-br ${gradients[card.type] || gradients.VIRTUAL} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/5" />
                  <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/5" />
                  <div className="flex items-start justify-between relative">
                    <CreditCard className="h-6 w-6 opacity-80" />
                    <Badge variant={frozen ? "warning" : "success"}>{frozen ? "FROZEN" : card.status}</Badge>
                  </div>
                  <p className="mt-6 font-mono text-lg tracking-widest relative">•••• •••• •••• {card.lastFour}</p>
                  <div className="flex items-center justify-between mt-4 relative">
                    <span className="text-xs uppercase tracking-wider opacity-90">{card.network}</span>
                    <span className="text-xs opacity-90">{String(card.expiryMonth).padStart(2, "0")}/{String(card.expiryYear).slice(-2)}</span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#8ea6b6]">{card.type.charAt(0)}{card.type.slice(1).toLowerCase()} card</span>
                    <span className="text-white font-medium">{(card as any).perTxLimit ? `₹${(card as any).perTxLimit.toLocaleString("en-IN")}/tx` : `₹${card.dailyLimit.toLocaleString("en-IN")}/day`}</span>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => patchCard(card.id, { internationalEnabled: !(card as any).internationalEnabled })}
                      className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${(card as any).internationalEnabled ? "border-[#4ade80]/50 text-[#4ade80]" : "border-[#1e3d4d] text-[#8ea6b6]"}`}>
                      <Globe className="w-3 h-3 inline mr-1" /> Intl {(card as any).internationalEnabled ? "ON" : "OFF"}
                    </button>
                    <select value={((card as any).blockedMccCategories || "").split(",")[0] || ""}
                      onChange={(e) => patchCard(card.id, { blockedMccCategories: e.target.value })}
                      className="bg-[#071a26] border border-[#1e3d4d] rounded-full text-[10px] px-2 py-1 text-[#8ea6b6] focus:outline-none">
                      <option value="">No MCC block</option>
                      {["GAMBLING", "CRYPTO"].map(m => <option key={m} value={m}>Block {m}</option>)}
                    </select>
                    {(card as any).dispatchStatus && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-[#fbbf24]/15 text-[#fbbf24]">📦 {(card as any).dispatchStatus === "CONFIRMING_ADDRESS" ? "Confirm address to dispatch" : (card as any).dispatchStatus}</span>
                    )}
                  </div>
                  {(card as any).type === "PHYSICAL" && !(card as any).dispatchStatus && (
                    <input placeholder="Confirm delivery address…" onBlur={e => e.target.value.trim().length > 5 && patchCard(card.id, { confirmDispatchAddress: e.target.value })}
                      className="w-full bg-[#071a26] border border-[#1e3d4d] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#8ea6b6] focus:outline-none focus:border-[#e8a33d]/50" />
                  )}

                  <Button variant="outline" size="sm" onClick={() => toggleFreeze(card)} disabled={busyId === card.id}
                    className="w-full gap-2 border-[#1e3d4d] text-[#c9d4de] hover:bg-[#071a26] hover:text-white">
                    {busyId === card.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Snowflake className="h-4 w-4" />}
                    {frozen ? "Unfreeze Card" : "Freeze Card"}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {/* Swipe simulator */}
      {cards.length > 0 && (
        <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-5 space-y-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-[#fbbf24]" /> POS / ATM Swipe Simulator</h3>
          {swipeResult && (
            <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm ${swipeResult.ok ? "bg-[#4ade80]/10 border-[#4ade80]/30 text-[#4ade80]" : "bg-[#f87171]/10 border-[#f87171]/30 text-[#f87171]"}`}>
              {swipeResult.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} {swipeResult.text}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-2">
            <select value={swipe.cardId} onChange={e => setSwipe(s => ({ ...s, cardId: e.target.value }))}
              className="bg-[#071a26] text-white rounded-lg px-3 py-2.5 text-sm border border-[#1e3d4d] focus:outline-none">
              <option value="">Select card</option>
              {cards.map(c => <option key={c.id} value={c.id}>····{c.lastFour} · {c.type}</option>)}
            </select>
            <select value={swipe.channel} onChange={e => setSwipe(s => ({ ...s, channel: e.target.value }))}
              className="bg-[#071a26] text-white rounded-lg px-3 py-2.5 text-sm border border-[#1e3d4d] focus:outline-none">
              {["POS", "ATM", "ONLINE"].map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={swipe.mccCategory} onChange={e => setSwipe(s => ({ ...s, mccCategory: e.target.value }))}
              className="bg-[#071a26] text-white rounded-lg px-3 py-2.5 text-sm border border-[#1e3d4d] focus:outline-none">
              {MCC_LIST.map(m => <option key={m}>{m}</option>)}
            </select>
            <input type="number" placeholder="Amount ₹" value={swipe.amount} onChange={e => setSwipe(s => ({ ...s, amount: e.target.value }))}
              className="bg-[#071a26] text-white rounded-lg px-3 py-2.5 text-sm border border-[#1e3d4d] focus:border-[#e8a33d]/50 focus:outline-none" />
          </div>
          <label className="flex items-center gap-2 text-xs text-[#8ea6b6]">
            <input type="checkbox" checked={swipe.intl} onChange={e => setSwipe(s => ({ ...s, intl: e.target.checked }))} className="accent-[#e8a33d]" />
            International merchant
          </label>
          <Button size="sm" onClick={runSwipe} disabled={!swipe.cardId || !swipe.amount}
            className="gap-2 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#d97706] text-[#1a1206] border-0">
            <Zap className="h-4 w-4" /> Run Swipe
          </Button>
        </div>
      )}

      {/* My applications under review */}
      {false && <span />}
    </div>
  )
}