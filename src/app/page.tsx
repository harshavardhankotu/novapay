import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Smartphone, Globe, Shield, PieChart, Users, Gift, ArrowRight, Star, Sparkles, Ship } from "lucide-react"
import { APP_NAME } from "@/lib/constants"

const features = [
  { icon: Smartphone, title: "Unified UPI + Global", desc: "One app for UPI, domestic transfers & international spending" },
  { icon: Globe, title: "Zero-Forex Spending", desc: "Interbank rates with 0% markup on international transactions" },
  { icon: Shield, title: "5-Minute KYC", desc: "Aadhaar eKYC + Video verification in under 5 minutes" },
  { icon: PieChart, title: "AI Budgeting", desc: "Smart insights with auto-categorization & spending forecasts" },
  { icon: Users, title: "Family Banking", desc: "Kids accounts with parent controls, limits & allowances" },
  { icon: Gift, title: "NovaPoints Rewards", desc: "Earn points on every spend, redeem for cashback & travel" },
]

const stats = [
  { label: "Active Users", value: "450K+" },
  { label: "Zero Forex Fee", value: "₹0" },
  { label: "KYC Time", value: "<5 min" },
  { label: "App Rating", value: "4.7★" },
]

function Particles() {
  return (
    <>
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            opacity: Math.random() * 0.5 + 0.2,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 2}s`,
          }}
        />
      ))}
    </>
  )
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#071a26] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(232,163,61,0.16)_0%,transparent_60%),radial-gradient(ellipse_50%_40%_at_100%_100%,rgba(45,212,191,0.08)_0%,transparent_60%),radial-gradient(ellipse_40%_30%_at_0%_80%,rgba(255,138,112,0.05)_0%,transparent_60%)]" />
      <Particles />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#e8a33d] to-[#2dd4bf] flex items-center justify-center shadow-lg shadow-[#e8a33d]/30">
            <Ship className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-white">{APP_NAME}</span>
            <span className="block text-[10px] text-[#8ea6b6] font-medium tracking-tight">Finance Beyond Horizons</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-[#8ea6b6] hover:text-white transition-colors">Log In</Link>
          <Link href="/signup"><Button size="sm" className="bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] hover:from-[#d18a24] hover:to-[#e0a64a] text-[#1a1206] border-0 shadow-lg shadow-[#e8a33d]/25">Get Started</Button></Link>
        </div>
      </header>

      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-16 sm:py-24 text-center max-w-6xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8a33d]/10 border border-[#e8a33d]/20 text-[#f2bd68] text-xs sm:text-sm font-medium mb-6 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-[#2dd4bf]" />
          Now available across India
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1] animate-slide-up">
          Banking That{" "}
          <span className="text-gradient">Flows With The Tide</span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-[#8ea6b6] max-w-xl leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
          UPI, multi-currency accounts, zero-forex cards, AI budgeting, and family banking — all in one calm, seamless experience.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Link href="/signup">
            <Button size="xl" className="w-full sm:w-auto text-base gap-2 bg-gradient-to-r from-[#e8a33d] to-[#2dd4bf] hover:from-[#d18a24] hover:to-[#14a390] text-[#071a26] border-0 shadow-lg shadow-[#e8a33d]/30 group">
              Launch Your Account <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="xl" className="w-full sm:w-auto text-base border-[#1e3d4d] text-[#8ea6b6] hover:bg-[#0e2633] hover:text-white hover:border-[#e8a33d]/30">
              Explore Dashboard
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mt-12 w-full max-w-2xl animate-slide-up" style={{ animationDelay: "0.3s" }}>
          {stats.map((s) => (
            <div key={s.label} className="text-center p-3 rounded-2xl bg-[#0e2633]/50 border border-[#1e3d4d]">
              <p className="text-2xl sm:text-3xl font-bold text-gradient">{s.value}</p>
              <p className="text-xs sm:text-sm text-[#8ea6b6] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-5 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Everything you need, nothing you don&apos;t</h2>
          <p className="text-[#8ea6b6] mt-2">Built for India. Calm by design.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="group p-5 rounded-2xl bg-[#0e2633]/50 border border-[#1e3d4d] hover:border-[#e8a33d]/30 card-hover">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#e8a33d]/20 to-[#2dd4bf]/20 flex items-center justify-center mb-4 group-hover:from-[#e8a33d]/30 group-hover:to-[#2dd4bf]/30 transition-all">
                  <Icon className="h-5 w-5 text-[#f2bd68]" />
                </div>
                <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-sm text-[#8ea6b6] leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="relative z-10 px-5 py-16 bg-[#06232f] border-y border-[#1e3d4d]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-semibold text-[#2dd4bf] uppercase tracking-wider">The Future Is Clear</span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-white">India&apos;s first truly unified banking experience</h2>
              <p className="text-[#8ea6b6] mt-3 leading-relaxed">
                No more juggling between GPay, your bank app, CRED, and Wise. Get everything in one place with better rates,
                smarter insights, and real-time control.
              </p>
              <div className="flex flex-col gap-3 mt-6">
                {[
                  "UPI + Domestic Cards + Multi-Currency Wallets",
                  "Zero-forex international spending at interbank rates",
                  "AI-powered budgeting with intelligent forecasts",
                  "Family accounts with granular parental controls",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-[#4ade80]/20 flex items-center justify-center mt-0.5 shrink-0">
                      <Star className="h-3 w-3 text-[#4ade80]" />
                    </div>
                    <span className="text-sm text-[#f3efe6]/80">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/signup"><Button className="bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] hover:from-[#d18a24] hover:to-[#e0a64a] text-[#1a1206] border-0 shadow-lg shadow-[#e8a33d]/25">Get Started <ArrowRight className="h-4 w-4 ml-1" /></Button></Link>
              </div>
            </div>
            <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#e8a33d]/10 to-[#2dd4bf]/5 border border-[#1e3d4d] hidden lg:block">
              <p className="text-lg font-semibold text-white">What our early users say</p>
              <div className="mt-6 space-y-6">
                {[
                  { quote: "Finally, an app that handles my UPI payments AND my USD spending without two different apps.", name: "Priya S., Bangalore" },
                  { quote: "Saved over ₹8,000 in forex fees on my last international trip. Game changer.", name: "Arun M., Mumbai" },
                  { quote: "The family banking feature is exactly what I needed for my teenager.", name: "Neha K., Delhi" },
                ].map((t) => (
                  <div key={t.name} className="border-l-2 border-[#e8a33d]/50 pl-4">
                    <p className="text-sm text-[#f3efe6]/90 italic">&ldquo;{t.quote}&rdquo;</p>
                    <p className="text-xs text-[#8ea6b6] mt-1">{t.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-5 py-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#8ea6b6]">&copy; 2026 {APP_NAME}. RBI-compliant. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-[#8ea6b6]">
            <Link href="/privacy" className="hover:text-[#f3efe6] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#f3efe6] transition-colors">Terms</Link>
            <Link href="/compliance" className="hover:text-[#f3efe6] transition-colors">Compliance</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}