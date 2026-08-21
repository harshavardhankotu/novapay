"use client"
import { useState } from "react"
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react"
import { APP_NAME } from "@/lib/constants"

const responses: Record<string, string> = {
  "hello": "Hey there! How can I help you today?",
  "hi": "Hello! What can I assist you with?",
  "kyc": "You can complete KYC in Settings > KYC. You'll need Aadhaar and PAN.",
  "card": "Go to Cards page to view, freeze, or order new cards.",
  "transfer": "Transfers can be done via NEFT/IMPS/UPI. Go to Transfers page.",
  "upi": "You can create and manage UPI IDs in Payments section.",
  "mpin": "Set/change MPIN in Security Hub > MPIN.",
  "limit": "UPI: ₹1L/txn. Card: depends on plan. Transfers: ₹10L/day NEFT.",
  "support": "Raise a ticket at Help > Contact Support. We're here 24/7.",
  "default": "I'm sorry, I didn't understand that. Please contact support for detailed help.",
}

export function Chatbot() {
  const [open, setOpen] = useState(false); const [messages, setMessages] = useState<{ from: "bot" | "user"; text: string }[]>([{ from: "bot", text: `Hi! I'm your ${APP_NAME} assistant. Ask me anything!` }])
  const [input, setInput] = useState("")

  const send = () => {
    if (!input.trim()) return
    setMessages(prev => [...prev, { from: "user", text: input }])
    const lower = input.toLowerCase()
    let reply = responses.default
    for (const [key, val] of Object.entries(responses)) {
      if (lower.includes(key)) { reply = val; break }
    }
    setTimeout(() => setMessages(prev => [...prev, { from: "bot", text: reply }]), 500)
    setInput("")
  }

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#e8a33d] to-[#2dd4bf] rounded-full flex items-center justify-center shadow-lg shadow-[#e8a33d]/30 hover:shadow-[#e8a33d]/50 z-50 hover:scale-105 transition-all">
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-[#0e2633] rounded-2xl border border-[#1e3d4d] shadow-2xl shadow-[#e8a33d]/10 z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[#1e3d4d]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2dd4bf]" />
              <span className="text-white font-medium">{APP_NAME} Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#8ea6b6] hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-80">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.from === "user" ? "bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] text-[#1a1206]" : "bg-[#0e2633] text-[#f3efe6] border border-[#1e3d4d]"}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-[#1e3d4d] flex gap-2">
            <input type="text" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} className="flex-1 bg-[#0e2633] text-white rounded-xl px-4 py-2.5 text-sm border border-[#1e3d4d] focus:outline-none focus:border-[#e8a33d]/50 placeholder:text-[#8ea6b6]" />
            <button onClick={send} className="bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] hover:from-[#d18a24] hover:to-[#e0a64a] p-2.5 rounded-xl"><Send className="w-4 h-4 text-[#1a1206]" /></button>
          </div>
        </div>
      )}
    </>
  )
}
