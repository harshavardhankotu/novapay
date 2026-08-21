"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Phone, Mail, FileText, ChevronRight, Search, HelpCircle, Shield, Clock } from "lucide-react"

const faqs = [
  { q: "How do I reset my UPI PIN?", category: "UPI" },
  { q: "What are the forex charges?", category: "Forex" },
  { q: "How to freeze a lost card?", category: "Cards" },
  { q: "How to add a beneficiary?", category: "Transfers" },
  { q: "What documents needed for KYC?", category: "Account" },
]

const contactOptions = [
  { icon: MessageCircle, label: "Live Chat", desc: "Get help in real-time", color: "#e8a33d", time: "< 1 min" },
  { icon: Phone, label: "Call Us", desc: "24/7 support line", color: "#2dd4bf", time: "2-5 min" },
  { icon: Mail, label: "Email", desc: "We respond in 2 hours", color: "#fbbf24", time: "< 2 hrs" },
]

export default function SupportPage() {
  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <p className="text-sm text-[#8ea6b6] mt-0.5">We&apos;re here to help 24/7</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8ea6b6]" />
        <input
          className="w-full h-12 pl-12 pr-4 rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] bg-white dark:bg-[#0e2633] text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d] placeholder:text-[#8ea6b6] shadow-sm"
          placeholder="Search help articles, FAQs..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {contactOptions.map((opt, i) => {
          const Icon = opt.icon
          return (
            <div key={opt.label} className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm hover:shadow-md transition-all cursor-pointer animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-center">
                <div className="h-12 w-12 rounded-xl mx-auto flex items-center justify-center mb-3" style={{ backgroundColor: `${opt.color}15` }}>
                  <Icon className="h-6 w-6" style={{ color: opt.color }} />
                </div>
                <p className="font-semibold">{opt.label}</p>
                <p className="text-xs text-[#8ea6b6] mt-1">{opt.desc}</p>
                <Badge variant="secondary" className="mt-2 text-[10px] gap-1">
                  <Clock className="h-3 w-3" /> Avg. {opt.time}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Frequently Asked Questions</h2>
          <button className="text-xs text-[#e8a33d] hover:underline">View all</button>
        </div>
        <div className="space-y-1">
          {faqs.map((faq) => (
            <div key={faq.q} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f3efe6] dark:hover:bg-[#0e2633] cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-4 w-4 text-[#8ea6b6] shrink-0" />
                <span className="text-sm">{faq.q}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="text-[10px]">{faq.category}</Badge>
                <ChevronRight className="h-4 w-4 text-[#8ea6b6]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0e2633] rounded-2xl border border-[#f3efe6] dark:border-[#1e3d4d] p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#4ade80]/10 flex items-center justify-center shrink-0">
            <Shield className="h-6 w-6 text-[#4ade80]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Secure & Regulated</p>
            <p className="text-xs text-[#8ea6b6]">NovaPay is RBI-regulated. Your deposits are insured up to ₹5 lakh.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
