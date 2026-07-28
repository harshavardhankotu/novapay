"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Phone, Mail, FileText, ChevronRight, Search } from "lucide-react"

const faqs = [
  { q: "How do I reset my UPI PIN?", category: "UPI" },
  { q: "What are the forex charges?", category: "Forex" },
  { q: "How to freeze a lost card?", category: "Cards" },
  { q: "How to add a beneficiary?", category: "Transfers" },
  { q: "What documents needed for KYC?", category: "Account" },
]

const contactOptions = [
  { icon: MessageCircle, label: "Live Chat", desc: "Get help in real-time", color: "#6c5ce7" },
  { icon: Phone, label: "Call Us", desc: "24/7 support line", color: "#00b894" },
  { icon: Mail, label: "Email", desc: "We respond in 2 hours", color: "#fdcb6e" },
]

export default function SupportPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Help & Support</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#636e72]" />
        <Input placeholder="Search help articles, FAQs..." className="pl-10 h-12 text-base" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {contactOptions.map((opt) => {
          const Icon = opt.icon
          return (
            <Card key={opt.label} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl mx-auto flex items-center justify-center mb-3" style={{ backgroundColor: `${opt.color}15` }}>
                  <Icon className="h-6 w-6" style={{ color: opt.color }} />
                </div>
                <p className="font-semibold">{opt.label}</p>
                <p className="text-xs text-[#636e72] mt-1">{opt.desc}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {faqs.map((faq) => (
            <div key={faq.q} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f8f9fa] dark:hover:bg-[#2d3436] cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-[#636e72]" />
                <span className="text-sm">{faq.q}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#636e72] bg-[#f8f9fa] dark:bg-[#2d3436] px-2 py-0.5 rounded">{faq.category}</span>
                <ChevronRight className="h-4 w-4 text-[#636e72]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
