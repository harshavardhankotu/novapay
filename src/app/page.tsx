import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Smartphone, Globe, Shield, PieChart, Users, Gift, ArrowRight, Star,
  Sparkles, Ship, GitFork, PlayCircle, BookOpen, Layers, Database,
  Fingerprint, Zap, Check,
} from "lucide-react"
import { APP_NAME, GITHUB_URL } from "@/lib/constants"
import { WaitlistForm } from "@/components/waitlist-form"
import { StarField } from "@/components/star-field"

const features = [
  { icon: Smartphone, title: "Unified UPI + Global", desc: "One interface for UPI, domestic transfers & international spending flows" },
  { icon: Globe, title: "Zero-Forex Flows", desc: "Interbank-rate simulation with 0% markup on international transactions" },
  { icon: Shield, title: "Real eKYC Logic", desc: "Aadhaar (Verhoeff checksum) + PAN verification with DigiLocker-style OTP" },
  { icon: PieChart, title: "Budgeting Engine", desc: "Auto-categorization, budgets, insights & round-up savings" },
  { icon: Users, title: "Family Banking", desc: "Kids accounts with parent controls, limits and allowances" },
  { icon: Gift, title: "Rewards System", desc: "Points, tiers and redemptions — wired to a real ledger" },
]

const kitStats = [
  { label: "API Routes", value: "40+" },
  { label: "Pages", value: "47" },
  { label: "External Dependencies", value: "0" },
  { label: "Cost to Run", value: "₹0" },
]

const stack = [
  { icon: Layers, title: "Next.js 16 App Router", desc: "Server components, route handlers, Turbopack-ready" },
  { icon: Database, title: "Prisma + libSQL/SQLite", desc: "File-based in dev, one-line switch to Turso free tier" },
  { icon: Fingerprint, title: "JWT Auth + OTP + eKYC", desc: "HttpOnly cookies, bcrypt, masked document storage" },
  { icon: Zap, title: "Tailwind v4 Design System", desc: "Deepwater & Golden Hour theme, dark-first, glass-morphism" },
]

function Particles() {
  return <StarField count={50} />
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
        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/docs" className="hidden sm:block text-sm font-medium text-[#8ea6b6] hover:text-white transition-colors">Docs</Link>
          <Link href="/pricing" className="text-sm font-medium text-[#8ea6b6] hover:text-white transition-colors">Pricing</Link>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-[#8ea6b6] hover:text-white transition-colors" aria-label="GitHub repository">
            <GitFork className="h-5 w-5" />
          </a>
          <Link href="/login" className="hidden sm:block text-sm font-medium text-[#8ea6b6] hover:text-white transition-colors">Log In</Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-16 sm:py-24 text-center max-w-6xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8a33d]/10 border border-[#e8a33d]/20 text-[#f2bd68] text-xs sm:text-sm font-medium mb-6 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-[#2dd4bf]" />
          Open Source · MIT Licensed · Zero-Cost Stack
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1] animate-slide-up">
          The Open-Source{" "}
          <span className="text-gradient">Digital Banking Platform</span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-[#8ea6b6] max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
          A production-grade fintech starter kit: full auth with OTP, eKYC verification, a real double-entry-style
          ledger, 47 screens and 40+ API routes. Clone it, learn from it, ship your own neobank on it.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Link href="/dashboard?demo=1">
            <Button size="xl" className="w-full sm:w-auto text-base gap-2 bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] hover:from-[#d18a24] hover:to-[#e0a64a] text-[#1a1206] border-0 shadow-lg shadow-[#e8a33d]/30 group">
              <PlayCircle className="h-5 w-5" /> Try Live Demo
            </Button>
          </Link>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button variant="outline" size="xl" className="w-full sm:w-auto text-base border-[#1e3d4d] text-[#c9d4de] hover:bg-[#0e2633] hover:text-white hover:border-[#e8a33d]/30 gap-2">
              <GitFork className="h-5 w-5" /> Star on GitHub
            </Button>
          </a>
        </div>
        <p className="mt-4 text-xs text-[#8ea6b6] animate-fade-in">
          No signup needed for the demo · or <Link href="/pricing" className="text-[#f2bd68] hover:text-[#f6cf8f]">get the Pro Kit →</Link>
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mt-12 w-full max-w-3xl animate-slide-up" style={{ animationDelay: "0.3s" }}>
          {kitStats.map((s) => (
            <div key={s.label} className="text-center p-4 rounded-2xl bg-[#0e2633]/50 border border-[#1e3d4d]">
              <p className="text-2xl sm:text-3xl font-bold text-gradient">{s.value}</p>
              <p className="text-xs sm:text-sm text-[#8ea6b6] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 px-5 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Every fintech feature you need, already built</h2>
          <p className="text-[#8ea6b6] mt-2">Not a UI mockup — every screen is wired to working APIs.</p>
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

      {/* STACK */}
      <section className="relative z-10 px-5 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Modern stack, zero-cost to run</h2>
          <p className="text-[#8ea6b6] mt-2">Deploys free on Vercel Hobby + Turso free tier. No API keys required.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stack.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.title} className="flex items-start gap-4 p-5 rounded-2xl bg-[#0e2633]/50 border border-[#1e3d4d] card-hover">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#e8a33d]/15 to-[#2dd4bf]/15 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-[#2dd4bf]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{s.title}</h3>
                  <p className="text-sm text-[#8ea6b6] mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* WHO IS IT FOR */}
      <section className="relative z-10 px-5 py-16 bg-[#06232f] border-y border-[#1e3d4d]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <span className="text-xs font-semibold text-[#2dd4bf] uppercase tracking-wider">Built For Builders</span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-white">Three ways people use NovaPay</h2>
              <div className="mt-6 space-y-5">
                {[
                  { title: "Launchpad", desc: "Fork it as the foundation for your own fintech product — auth, KYC, ledger and design system already done." },
                  { title: "Classroom", desc: "Business & engineering schools use it as a hands-on banking lab: students operate a fully working digital bank." },
                  { title: "Portfolio", desc: "The deepest full-stack project you can show: payments simulation, regulatory logic, tests, CI and theming." },
                ].map((u) => (
                  <div key={u.title} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#4ade80]/20 flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="h-3.5 w-3.5 text-[#4ade80]" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{u.title}</p>
                      <p className="text-sm text-[#8ea6b6] mt-0.5 leading-relaxed">{u.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link href="/docs"><Button variant="outline" className="gap-2 border-[#1e3d4d] text-[#c9d4de] hover:bg-[#0e2633] hover:text-white"><BookOpen className="h-4 w-4" /> Read the Docs</Button></Link>
                <Link href="/pricing"><Button className="gap-2 bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] hover:from-[#d18a24] hover:to-[#e0a64a] text-[#1a1206] border-0">See Pricing <ArrowRight className="h-4 w-4" /></Button></Link>
              </div>
            </div>
            <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#e8a33d]/10 to-[#2dd4bf]/5 border border-[#1e3d4d]">
              <p className="text-lg font-semibold text-white">What&apos;s inside the box</p>
              <div className="mt-6 space-y-4">
                {[
                  "OTP login with Indian phone (+91) handling",
                  "DigiLocker-style eKYC: Aadhaar Verhoeff checksum + PAN regex",
                  "Atomic transfers & bill payments that actually move balances",
                  "Cards, FDs, loans, mutual funds, gold, crypto, family accounts",
                  "Legal pages, compliance centre & PWA manifest",
                  "Vitest test suite + GitHub Actions CI",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Star className="h-4 w-4 text-[#fbbf24] mt-0.5 shrink-0" />
                    <span className="text-sm text-[#c9d4de] leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 rounded-xl bg-[#071a26]/60 border border-[#1e3d4d]">
                <p className="text-xs text-[#8ea6b6] leading-relaxed">
                  Money movement is simulated by design — meaning zero licences, zero compliance costs,
                  and you can legally deploy it anywhere today.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 px-5 py-20 text-center max-w-3xl mx-auto w-full">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">Start exploring in one click</h2>
        <p className="text-[#8ea6b6] mt-3">The demo drops you into a fully populated account — cards, transactions, deposits and all.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link href="/dashboard?demo=1">
            <Button size="lg" className="gap-2 bg-gradient-to-r from-[#e8a33d] to-[#2dd4bf] hover:from-[#d18a24] hover:to-[#14a390] text-[#071a26] border-0 shadow-lg shadow-[#e8a33d]/30 group">
              <PlayCircle className="h-5 w-5" /> Launch Live Demo
            </Button>
          </Link>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="gap-2 border-[#1e3d4d] text-[#c9d4de] hover:bg-[#0e2633] hover:text-white">
              <GitFork className="h-5 w-5" /> View Source
            </Button>
          </a>
        </div>

        <div className="mt-14 pt-10 border-t border-[#1e3d4d]/50">
          <p className="text-lg font-semibold text-white">Not ready to dive in?</p>
          <p className="text-sm text-[#8ea6b6] mt-1 mb-5">Join the list for launch updates, new modules & the Pro Kit drop.</p>
          <WaitlistForm source="landing-footer" />
        </div>
      </section>

      <footer className="relative z-10 px-5 py-8 max-w-6xl mx-auto w-full border-t border-[#1e3d4d]/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#8ea6b6]">&copy; 2026 {APP_NAME}. Open source under MIT.</p>
          <div className="flex items-center gap-6 text-sm text-[#8ea6b6]">
            <Link href="/privacy" className="hover:text-[#f3efe6] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#f3efe6] transition-colors">Terms</Link>
            <Link href="/compliance" className="hover:text-[#f3efe6] transition-colors">Compliance</Link>
            <Link href="/pricing" className="hover:text-[#f3efe6] transition-colors">Pricing</Link>
            <Link href="/docs" className="hover:text-[#f3efe6] transition-colors">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}