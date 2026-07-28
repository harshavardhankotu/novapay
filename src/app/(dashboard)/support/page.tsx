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
  { icon: MessageCircle, label: "Live Chat", desc: "Get help in real-time", color: "#5046e5", time: "< 1 min" },
  { icon: Phone, label: "Call Us", desc: "24/7 support line", color: "#00b894", time: "2-5 min" },
  { icon: Mail, label: "Email", desc: "We respond in 2 hours", color: "#fdcb6e", time: "< 2 hrs" },
]

export default function SupportPage() {
  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <p className="text-sm text-[#636e72] mt-0.5">We&apos;re here to help 24/7</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#636e72]" />
        <input
          className="w-full h-12 pl-12 pr-4 rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] bg-white dark:bg-[#15152a] text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72] shadow-sm"
          placeholder="Search help articles, FAQs..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {contactOptions.map((opt, i) => {
          const Icon = opt.icon
          return (
            <div key={opt.label} className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm hover:shadow-md transition-all cursor-pointer animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-center">
                <div className="h-12 w-12 rounded-xl mx-auto flex items-center justify-center mb-3" style={{ backgroundColor: `${opt.color}15` }}>
                  <Icon className="h-6 w-6" style={{ color: opt.color }} />
                </div>
                <p className="font-semibold">{opt.label}</p>
                <p className="text-xs text-[#636e72] mt-1">{opt.desc}</p>
                <Badge variant="secondary" className="mt-2 text-[10px] gap-1">
                  <Clock className="h-3 w-3" /> Avg. {opt.time}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Frequently Asked Questions</h2>
          <button className="text-xs text-[#5046e5] hover:underline">View all</button>
        </div>
        <div className="space-y-1">
          {faqs.map((faq) => (
            <div key={faq.q} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f8f9fc] dark:hover:bg-[#1a1a30] cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-4 w-4 text-[#636e72] shrink-0" />
                <span className="text-sm">{faq.q}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="text-[10px]">{faq.category}</Badge>
                <ChevronRight className="h-4 w-4 text-[#636e72]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#00b894]/10 flex items-center justify-center shrink-0">
            <Shield className="h-6 w-6 text-[#00b894]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Secure & Regulated</p>
            <p className="text-xs text-[#636e72]">Revolut India is RBI-regulated. Your deposits are insured up to ₹5 lakh.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
