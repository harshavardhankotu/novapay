"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, User, Building2, Globe, Clock, Star, Search, CheckCircle2, AlertCircle, Loader2, ArrowUpDown } from "lucide-react"
import * as React from "react"
import { useLang } from "@/lib/i18n/provider"
import { useUserStore } from "@/store/user-store"

type TxMethod = "neft" | "upi" | "international"

interface Beneficiary {
  id: string
  name: string
  type: string
  accountNumber?: string | null
  upiId?: string | null
  isFavourite?: boolean
}

export function SendMoneyForm() {
  const { t } = useLang()
  const { accounts, fetchMe } = useUserStore()
  const [method, setMethod] = React.useState<TxMethod>("neft")
  const [fromAccountId, setFromAccountId] = React.useState("")
  const [recipient, setRecipient] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [note, setNote] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "loading" | "done" | "error">("idle")
  const [message, setMessage] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [beneficiaries, setBeneficiaries] = React.useState<Beneficiary[]>([])

  // Keep a stable idempotency key per "attempt": regenerated after each
  // successful/failed completion so retries of the SAME submission reuse it,
  // but a fresh payment always gets a new key.
  const dedupeRef = React.useRef<string>(crypto.randomUUID())

  const fromAccount = accounts.find((a) => a.id === fromAccountId)
  const effectiveFromId = fromAccountId || accounts[0]?.id || ""

  React.useEffect(() => {
    fetch("/api/beneficiaries")
      .then((r) => r.json())
      .then((d: Beneficiary[]) => setBeneficiaries(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  const filtered = beneficiaries.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.upiId || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.accountNumber || "").includes(search)
  )

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAccountId: effectiveFromId,
          toAccountNumber: recipient.trim(),
          amount: parseFloat(amount),
          note: note || undefined,
          dedupeKey: dedupeRef.current,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Transfer failed")
      setStatus("done")
      setMessage(`₹${parseFloat(amount).toLocaleString("en-IN")} sent${data.pointsEarned ? ` · earned ${data.pointsEarned} NovaPoints` : ""}${data.duplicate ? " (duplicate ignored)" : ""}`)
      dedupeRef.current = crypto.randomUUID()
      setAmount(""); setNote(""); setRecipient("")
      fetchMe()
    } catch (err: any) {
      // Keep the same dedupeKey so a retry of THIS payment cannot double-debit
      setStatus("error")
      setMessage(err?.message || "Transfer failed")
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-5 shadow-sm">
        <div className="flex gap-1.5 bg-[#071a26] rounded-xl p-1 mb-5">
          {[
            { id: "neft" as const, label: "NEFT / IMPS", icon: Building2 },
            { id: "upi" as const, label: "UPI Transfer", icon: ArrowUpDown },
            { id: "international" as const, label: "International", icon: Globe },
          ].map((m) => {
            const Icon = m.icon
            return (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${method === m.id ? "bg-gradient-to-r from-[#e8a33d]/25 to-[#2dd4bf]/15 text-white border border-[#e8a33d]/30" : "text-[#8ea6b6] hover:text-white"}`}>
                <Icon className="h-4 w-4" /> {m.label}
              </button>
            )
          })}
        </div>

        {status === "done" && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/30 text-sm text-[#4ade80]">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> {message}
          </div>
        )}
        {status === "error" && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-[#f87171]/10 border border-[#f87171]/30 text-sm text-[#f87171]">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {message}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#8ea6b6] block mb-1.5">From account</label>
            <select value={effectiveFromId} onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-[#071a26] border border-[#1e3d4d] text-white text-sm focus:outline-none focus:border-[#e8a33d]/50">
              {accounts.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.type} ····{String(a.accountNumber).slice(-6)} · ₹{Number(a.balance).toLocaleString("en-IN")}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#8ea6b6] flex items-center gap-1.5 mb-1.5">
                <User className="h-3.5 w-3.5" /> From
                <span className="ml-auto">{fromAccount ? `₹${Number(fromAccount.balance).toLocaleString("en-IN")}` : ""}</span>
              </label>
              <input readOnly value={fromAccount?.type === "SAVINGS" ? "Your Savings" : "Current A/c"}
                className="w-full h-11 px-3 rounded-xl bg-[#071a26] border border-[#1e3d4d] text-white text-sm opacity-80" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#8ea6b6] flex items-center gap-1.5 mb-1.5">
                <ArrowRight className="h-3.5 w-3.5" /> To
              </label>
              <input value={method === "upi" ? recipient.replace(/^([^.@]+)(@[\w.]+)?$/, "$1") : recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={method === "international" ? "IBAN / SWIFT acct" : method === "upi" ? "name@bank UPI ID or acct no." : "Account number"}
                className="w-full h-11 px-3 rounded-xl bg-[#0e2633] border border-[#1e3d4d] text-white text-sm focus:outline-none focus:border-[#e8a33d]/50 placeholder:text-[#8ea6b6]/60" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#8ea6b6] block mb-1.5">Amount (₹)</label>
              <input type="number" min="1" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-11 px-3 rounded-xl bg-[#0e2633] border border-[#1e3d4d] text-white text-lg font-semibold focus:outline-none focus:border-[#e8a33d]/50 placeholder:text-[#8ea6b6]/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#8ea6b6] block mb-1.5">Note (optional)</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={50} placeholder="Rent, dinner…"
                className="w-full h-11 px-3 rounded-xl bg-[#0e2633] border border-[#1e3d4d] text-white text-sm focus:outline-none focus:border-[#e8a33d]/50 placeholder:text-[#8ea6b6]/40" />
            </div>
          </div>

          <Button type="submit" disabled={status === "loading" || !amount || !fromAccountId}
            className={`w-full h-12 text-base border-0 ${status !== "loading" ? "bg-gradient-to-r from-[#e8a33d] to-[#2dd4bf] hover:from-[#d18a24] hover:to-[#14a390] text-[#071a26]" : ""}`}>
            {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : <>{t("sendMoney")} <ArrowRight className="h-4 w-4 ml-1" /></>}
          </Button>
          <p className="text-[10px] text-center text-[#8ea6b6]">
            Protected by limits, OTP session & idempotency keys · debits earn NovaPoints
          </p>
        </form>
      </div>

      {/* Quick recipients */}
      <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2"><Star className="h-4 w-4 text-[#fbbf24]" /> Frequent recipients</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8ea6b6]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search"
              className="w-36 h-8 pl-8 pr-2 rounded-lg bg-[#071a26] border border-[#1e3d4d] text-xs text-white focus:outline-none focus:border-[#e8a33d]/40" />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-2">
          {filtered.map((b) => {
            const detail = b.upiId || `${b.accountNumber?.slice(0, 4)}···${b.accountNumber?.slice(-4)}`
            return (
              <button key={b.id} onClick={() => setRecipient(b.upiId || b.accountNumber || "")}
                className="text-left p-3 rounded-xl border border-[#1e3d4d] hover:border-[#e8a33d]/40 transition-all group">
                <p className="text-sm font-medium text-white truncate flex items-center gap-1">
                  {b.name}
                  {b.isFavourite && <Star className="h-3 w-3 text-[#fbbf24] shrink-0" />}
                </p>
                <p className="text-[11px] text-[#8ea6b6] mt-0.5 truncate">{detail}</p>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <p className="text-xs text-[#8ea6b6] col-span-3 py-4 text-center">No saved recipients yet — enter details above to send.</p>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-[#1e3d4d] flex items-center gap-2 text-[11px] text-[#8ea6b6]">
          <Clock className="h-3 w-3" /> New beneficiaries at real banks have a 30-min cooling period — simulated here without the wait.
        </div>
      </div>
    </div>
  )
}