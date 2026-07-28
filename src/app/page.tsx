import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Smartphone, Globe, Shield, PieChart, Users, Gift, ArrowRight, Star, ChevronRight } from "lucide-react"

const features = [
  { icon: Smartphone, title: "Unified UPI + Global", desc: "One app for UPI, domestic transfers & international spending" },
  { icon: Globe, title: "Zero-Forex Spending", desc: "Interbank rates with 0% markup on international transactions" },
  { icon: Shield, title: "5-Minute KYC", desc: "Aadhaar eKYC + Video verification in under 5 minutes" },
  { icon: PieChart, title: "AI Budgeting", desc: "Smart insights in Hindi & English with auto-categorization" },
  { icon: Users, title: "Family Banking", desc: "Kids accounts with parent controls, limits & allowances" },
  { icon: Gift, title: "RevPoints Rewards", desc: "Earn points on every spend, redeem for cashback & travel" },
]

const stats = [
  { label: "Users On Platform", value: "450K+" },
  { label: "Zero Forex Fee", value: "₹0" },
  { label: "KYC Time", value: "<5 min" },
  { label: "Rating", value: "4.7★" },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0a0a14]">
      <header className="flex items-center justify-between px-5 py-4 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-[#5046e5]/20">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-bold text-lg">Revolut</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-[#636e72] hover:text-[#1a1a2e] dark:hover:text-white">Log In</Link>
          <Link href="/signup"><Button size="sm">Get Started</Button></Link>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-5 py-16 sm:py-24 text-center max-w-6xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5046e5]/10 text-[#5046e5] text-xs sm:text-sm font-medium mb-6">
          <span className="h-2 w-2 rounded-full bg-[#00b894] animate-pulse" />
          Now available in India
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1]">
          Banking That{" "}
          <span className="gradient-primary bg-clip-text text-transparent">Borders Don&apos;t Limit</span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-[#636e72] max-w-xl leading-relaxed">
          UPI, multi-currency accounts, zero-forex cards, AI budgeting, and family banking — all in one app.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
          <Link href="/signup">
            <Button size="xl" className="w-full sm:w-auto text-base gap-2">
              Open Your Account <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="xl" className="w-full sm:w-auto text-base">
              View Demo
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mt-12 w-full max-w-2xl">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold gradient-primary bg-clip-text text-transparent">{s.value}</p>
              <p className="text-xs sm:text-sm text-[#636e72] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold">Everything you need, nothing you don&apos;t</h2>
          <p className="text-[#636e72] mt-2">Built for India. Designed for the world.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="group p-5 rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] hover:border-[#5046e5]/30 hover:shadow-lg hover:shadow-[#5046e5]/5 transition-all duration-300">
                <div className="h-11 w-11 rounded-xl bg-[#5046e5]/10 flex items-center justify-center mb-4 group-hover:bg-[#5046e5]/20 transition-colors">
                  <Icon className="h-5 w-5 text-[#5046e5]" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-[#636e72] leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="px-5 py-16 bg-[#f8f9fc] dark:bg-[#0a0a14] border-y border-[#e8eaed] dark:border-[#2a2a45]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-semibold text-[#5046e5] uppercase tracking-wider">Coming Soon</span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2">India&apos;s first truly unified banking experience</h2>
              <p className="text-[#636e72] mt-3 leading-relaxed">
                No more juggling between GPay, your bank app, CRED, and Wise. Get everything in one place with better rates, 
                smarter insights, and real-time control.
              </p>
              <div className="flex flex-col gap-3 mt-6">
                {[
                  "UPI + Domestic Cards + Multi-Currency Wallets",
                  "Zero-forex international spending at interbank rates",
                  "AI-powered budgeting in Hindi and English",
                  "Family accounts with granular parental controls",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-[#00b894]/20 flex items-center justify-center mt-0.5 shrink-0">
                      <Star className="h-3 w-3 text-[#00b894]" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/signup"><Button>Join the waitlist <ChevronRight className="h-4 w-4 ml-1" /></Button></Link>
              </div>
            </div>
            <div className="gradient-card rounded-3xl p-8 sm:p-10 text-white hidden lg:block">
              <p className="text-lg font-semibold">What our early users say</p>
              <div className="mt-6 space-y-6">
                {[
                  { quote: "Finally, an app that handles my UPI payments AND my USD spending without two different apps.", name: "Priya S., Bangalore" },
                  { quote: "Saved over ₹8,000 in forex fees on my last international trip. Game changer.", name: "Arun M., Mumbai" },
                  { quote: "The family banking feature is exactly what I needed for my teenager.", name: "Neha K., Delhi" },
                ].map((t) => (
                  <div key={t.name} className="border-l-2 border-white/30 pl-4">
                    <p className="text-sm text-white/90 italic">&ldquo;{t.quote}&rdquo;</p>
                    <p className="text-xs text-white/60 mt-1">{t.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-5 py-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#636e72]">&copy; 2026 Revolut India. RBI-compliant. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-[#636e72]">
            <Link href="#" className="hover:text-[#1a1a2e] dark:hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#1a1a2e] dark:hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[#1a1a2e] dark:hover:text-white transition-colors">Compliance</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
