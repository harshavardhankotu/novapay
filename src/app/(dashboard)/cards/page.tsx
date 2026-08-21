"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Snowflake, CreditCard, Loader2, AlertCircle } from "lucide-react"

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
      .then((d: CardRow[]) => { if (alive) setCards(Array.isArray(d) ? d : []) })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [reloadTick])

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
                    <span className="text-white font-medium">₹{card.dailyLimit.toLocaleString("en-IN")}/day</span>
                  </div>
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
    </div>
  )
}