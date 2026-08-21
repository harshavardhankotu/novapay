"use client"

import { useState } from "react"
import { Mail, Loader2, CheckCircle2 } from "lucide-react"

export function WaitlistForm({ source = "landing" }: { source?: string }) {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [message, setMessage] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setState("loading")
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error)
      setState("done")
      setMessage(data.alreadySubscribed ? "You're already on the list." : data.position ? `You're #${data.position} on the list.` : "You're on the list.")
    } catch (err: any) {
      setState("error")
      setMessage(err?.message || "Something went wrong")
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/30 text-sm text-[#4ade80]">
        <CheckCircle2 className="h-4 w-4 shrink-0" /> {message}
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md mx-auto">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8ea6b6]" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle") }}
          placeholder="you@example.com"
          className="w-full h-11 pl-9 pr-3 rounded-xl bg-[#0e2633] border border-[#1e3d4d] text-white text-sm focus:outline-none focus:border-[#e8a33d]/50 placeholder:text-[#8ea6b6]"
        />
      </div>
      <button
        type="submit"
        disabled={state === "loading"}
        className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] hover:from-[#d18a24] hover:to-[#e0a64a] text-[#1a1206] text-sm font-semibold transition-all disabled:opacity-60 whitespace-nowrap"
      >
        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Get Early Access"}
      </button>
      {state === "error" && <p className="text-xs text-[#f87171] sm:hidden">{message}</p>}
    </form>
  )
}