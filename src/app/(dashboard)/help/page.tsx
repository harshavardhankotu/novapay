"use client"
import { useState } from "react"
import { Search, ChevronRight, MessageCircle, FileText, LifeBuoy, ShieldCheck, Smartphone, CreditCard, ArrowUpDown, Settings, HelpCircle } from "lucide-react"

const faqs = [
  { q: "How do I reset my MPIN?", a: "Go to Security Hub > MPIN > Change MPIN. You'll need your current MPIN." },
  { q: "What documents needed for KYC?", a: "Aadhaar card and PAN card. Virtual KYC via video call also available." },
  { q: "How to freeze my card?", a: "Cards page > Select card > Freeze. Instant freeze/unfreeze." },
  { q: "What are UPI transaction limits?", a: "₹1L per transaction, ₹5L per day for UPI payments." },
  { q: "How to add a beneficiary?", a: "Transfers > Beneficiaries > Add. Needs IFSC and account number." },
  { q: "International transfer fees?", a: "₹500 flat for SWIFT. ₹0 for SEPA. Exchange rate mark-up 0.5%." },
  { q: "How does RuPay Credit work?", a: "Credit line on UPI. Interest-free for 45 days. Repay via UPI or debit." },
  { q: "What is LRS limit?", a: "RBI allows $250,000 per financial year per individual under LRS." },
  { q: "How to set up 2FA?", a: "Security > Two-Factor Auth > Enable. Use Google Authenticator or Authy." },
  { q: "How to close my account?", a: "Contact support via Support Tickets. Account closure takes 5 business days." },
]

const categories = [
  { icon: ShieldCheck, label: "Security", color: "text-[#2dd4bf]" },
  { icon: Smartphone, label: "UPI & Payments", color: "text-blue-400" },
  { icon: CreditCard, label: "Cards", color: "text-purple-400" },
  { icon: ArrowUpDown, label: "Transfers", color: "text-amber-400" },
  { icon: Settings, label: "Account Settings", color: "text-[#8ea6b6]" },
  { icon: LifeBuoy, label: "Support", color: "text-red-400" },
]

export default function HelpPage() {
  const [search, setSearch] = useState(""); const [openFaq, setOpenFaq] = useState<number | null>(null)
  const filtered = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Help Center</h1><p className="text-[#8ea6b6] text-sm">FAQs · Guides · Contact support</p></div>
      <div className="relative"><Search className="absolute left-4 top-3.5 w-5 h-5 text-[#8ea6b6]" /><input type="text" placeholder="Search help articles..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-[#0e2633] text-white rounded-2xl pl-12 pr-4 py-3 border border-[#1e3d4d] focus:outline-none focus:border-[#2dd4bf]" /></div>
      {!search && <div className="grid grid-cols-3 gap-3">{categories.map(c => <div key={c.label} className="bg-[#0e2633] rounded-2xl p-4 border border-[#1e3d4d] text-center hover:border-[#1e3d4d] cursor-pointer"><c.icon className={`w-6 h-6 mx-auto mb-2 ${c.color}`} /><p className="text-white text-xs font-medium">{c.label}</p></div>)}</div>}
      <div className="space-y-2">
        <h2 className="text-white font-semibold">{search ? `${filtered.length} results` : "Frequently Asked Questions"}</h2>
        {filtered.length === 0 ? <p className="text-[#8ea6b6] text-sm py-4 text-center">No results found. Try different keywords.</p> :
          filtered.map((faq, i) => (
            <div key={i} className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-4 py-3 flex items-center justify-between text-left">
                <span className="text-white text-sm">{faq.q}</span>
                <ChevronRight className={`w-4 h-4 text-[#8ea6b6] transition ${openFaq === i ? "rotate-90" : ""}`} />
              </button>
              {openFaq === i && <div className="px-4 pb-3"><p className="text-[#8ea6b6] text-sm">{faq.a}</p></div>}
            </div>
          ))}
      </div>
      <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] text-center">
        <MessageCircle className="w-8 h-8 mx-auto text-[#2dd4bf] mb-2" />
        <p className="text-white font-medium">Still need help?</p>
        <p className="text-[#8ea6b6] text-sm mt-1">Our support team is available 24/7</p>
        <a href="/tickets" className="inline-block mt-3 bg-[#2dd4bf] text-white px-6 py-2 rounded-lg text-sm font-medium">Contact Support</a>
      </div>
    </div>
  )
}
