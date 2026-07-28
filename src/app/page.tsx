import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Smartphone, Globe, Shield, Users, PieChart, Gift } from "lucide-react"

const features = [
  { icon: Smartphone, title: "Unified UPI + Global", desc: "One app for UPI payments, domestic transfers & international spending" },
  { icon: Globe, title: "Zero-Forex Spending", desc: "Interbank exchange rates with 0% markup on international transactions" },
  { icon: Shield, title: "5-Minute KYC", desc: "Instant account opening with Aadhaar eKYC & Video verification" },
  { icon: PieChart, title: "AI Budgeting", desc: "Smart spending insights in Hindi & English with auto-categorization" },
  { icon: Users, title: "Family Banking", desc: "Kids accounts with parent controls, task-based allowances & limits" },
  { icon: Gift, title: "RevPoints Rewards", desc: "Earn points on every transaction, redeem for cashback & travel" },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#dfe6e9] max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-bold text-xl">Revolut</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-[#636e72] hover:text-[#2d3436] dark:hover:text-white">Log In</Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-7xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6c5ce7]/10 text-[#6c5ce7] text-sm font-medium mb-6">
          <span className="h-2 w-2 rounded-full bg-[#00b894] animate-pulse" />
          Now available in India
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl">
          Banking That{" "}
          <span className="gradient-primary bg-clip-text text-transparent">Borders Don't Limit</span>
        </h1>
        <p className="mt-6 text-lg text-[#636e72] max-w-xl">
          UPI, multi-currency accounts, zero-forex cards, AI budgeting, and family banking — all in one app.
        </p>
        <div className="flex items-center gap-4 mt-8">
          <Link href="/signup">
            <Button size="lg" className="text-base">
              Open Your Account <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="text-base">
              View Demo
            </Button>
          </Link>
        </div>
      </section>

      <section className="px-6 py-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="p-6 rounded-xl border border-[#dfe6e9] dark:border-[#2d3436] hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-[#6c5ce7]/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-[#6c5ce7]" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-[#636e72]">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <footer className="px-6 py-8 border-t border-[#dfe6e9]">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#636e72]"> 2026 Revolut India. RBI-compliant. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-[#636e72]">
            <Link href="#" className="hover:text-[#2d3436] dark:hover:text-white">Privacy</Link>
            <Link href="#" className="hover:text-[#2d3436] dark:hover:text-white">Terms</Link>
            <Link href="#" className="hover:text-[#2d3436] dark:hover:text-white">Compliance</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
