import Link from "next/link"
import { Ship, ArrowLeft, Check, GitFork, Download, GraduationCap, Sparkles } from "lucide-react"
import { APP_NAME, GITHUB_URL } from "@/lib/constants"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: `Pricing — ${APP_NAME}`,
  description: "Free open source forever. Pro kit and institutional licensing for teams and classrooms.",
}

const tiers = [
  {
    name: "Open Source",
    price: "₹0",
    period: "forever",
    tagline: "The full platform, MIT licensed.",
    icon: GitFork,
    cta: "Star & Clone on GitHub",
    ctaHref: GITHUB_URL,
    ctaExternal: true,
    featured: false,
    features: [
      "Complete source code (47 pages, 40+ API routes)",
      "OTP auth + eKYC + ledger + all banking modules",
      "Deepwater & Golden Hour design system",
      "Vitest tests + GitHub Actions CI",
      "Self-host anywhere — Vercel/Railway/VPS free tiers",
      "Community support via GitHub Issues",
    ],
  },
  {
    name: "Pro Kit",
    price: "₹1,999",
    period: "one-time",
    tagline: "Everything you need to ship faster.",
    icon: Download,
    cta: "Get the Pro Kit",
    ctaHref: "#", // TODO: replace with your Gumroad product link
    ctaExternal: true,
    featured: true,
    features: [
      "Everything in Open Source",
      "3 additional premium themes",
      "Admin analytics dashboard pack",
      "One-command deploy scripts (Turso + Vercel)",
      "PDF architecture handbook & API cookbook",
      "Priority updates & private Discord channel",
      "Commercial license — use it in client work",
    ],
  },
  {
    name: "Institution",
    price: "Custom",
    period: "per cohort",
    tagline: "A working fintech lab for your classroom.",
    icon: GraduationCap,
    cta: "Talk to Us",
    ctaHref: "mailto:hello@novapay.in?subject=NovaPay%20Institution%20License",
    ctaExternal: false,
    featured: false,
    features: [
      "Multi-seat licence for labs & bootcamps",
      "Curriculum mapped to modules (auth → KYC → ledger)",
      "Instructor guide with graded exercises",
      "Private deployment assistance",
      "Guest lecture / workshop option",
      "Invoice & PO billing supported",
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#071a26] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(232,163,61,0.14)_0%,transparent_60%)]" />
      <header className="relative z-10 border-b border-[#1e3d4d] sticky top-0 bg-[#071a26]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#e8a33d] to-[#2dd4bf] flex items-center justify-center">
              <Ship className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">{APP_NAME}</span>
          </Link>
          <Link href="/" className="text-sm text-[#8ea6b6] hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-5 py-14">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8a33d]/10 border border-[#e8a33d]/20 text-[#f2bd68] text-xs font-medium mb-5">
            <Sparkles className="h-3.5 w-3.5 text-[#2dd4bf]" /> Simple, honest pricing
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold text-white">Free forever. Pay only to move faster.</h1>
          <p className="text-[#8ea6b6] mt-4 leading-relaxed">
            The core platform is open source and free for any purpose. Paid options exist for people who
            want premium extras or classroom support — they keep the project alive.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 mt-12 items-stretch">
          {tiers.map((tier) => {
            const Icon = tier.icon
            return (
              <div
                key={tier.name}
                className={`relative rounded-3xl p-7 flex flex-col ${
                  tier.featured
                    ? "bg-gradient-to-b from-[#e8a33d]/15 to-[#0e2633] border-2 border-[#e8a33d]/50 shadow-lg shadow-[#e8a33d]/10 lg:-translate-y-2"
                    : "bg-[#0e2633]/60 border border-[#1e3d4d]"
                }`}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] text-[#1a1206] text-xs font-bold">
                    MOST POPULAR
                  </span>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${tier.featured ? "bg-[#e8a33d]/25" : "bg-[#1e3d4d]"}`}>
                    <Icon className={`h-5 w-5 ${tier.featured ? "text-[#f2bd68]" : "text-[#8ea6b6]"}`} />
                  </div>
                  <h2 className="text-lg font-bold text-white">{tier.name}</h2>
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                  <span className="text-sm text-[#8ea6b6] pb-1.5">/ {tier.period}</span>
                </div>
                <p className="text-sm text-[#8ea6b6] mt-2">{tier.tagline}</p>

                <ul className="mt-6 space-y-2.5 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#c9d4de]">
                      <Check className="h-4 w-4 text-[#4ade80] shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {tier.ctaExternal ? (
                  <a href={tier.ctaHref} target="_blank" rel="noopener noreferrer" className="mt-7 block">
                    <Button
                      className={`w-full h-11 border-0 ${
                        tier.featured
                          ? "bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] hover:from-[#d18a24] hover:to-[#e0a64a] text-[#1a1206]"
                          : "bg-[#0e2633] border border-[#1e3d4d] text-white hover:border-[#e8a33d]/40"
                      }`}
                    >
                      {tier.cta}
                    </Button>
                  </a>
                ) : (
                  <a href={tier.ctaHref} className="mt-7 block">
                    <Button variant="outline" className="w-full h-11 border-[#1e3d4d] text-white hover:bg-[#0e2633] hover:border-[#e8a33d]/40">
                      {tier.cta}
                    </Button>
                  </a>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-4 text-center">
          {[
            { title: "No subscriptions", desc: "One-time payments. No lock-in, no recurring charges." },
            { title: "Yours forever", desc: "Buy once, use the code in unlimited personal projects." },
            { title: "Zero-cost stack", desc: "Free tiers end-to-end: Vercel Hobby + Turso + GitHub." },
          ].map((n) => (
            <div key={n.title} className="p-5 rounded-2xl bg-[#0e2633]/40 border border-[#1e3d4d]">
              <p className="font-semibold text-white text-sm">{n.title}</p>
              <p className="text-xs text-[#8ea6b6] mt-1 leading-relaxed">{n.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[#8ea6b6] mt-10">
          Questions? Email <a href="mailto:hello@novapay.in" className="text-[#f2bd68] hover:text-[#f6cf8f]">hello@novapay.in</a> ·{" "}
          <Link href="/docs" className="text-[#f2bd68] hover:text-[#f6cf8f]">Read the docs first</Link>
        </p>
      </main>

      <footer className="relative z-10 border-t border-[#1e3d4d]/50 px-5 py-6 max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#8ea6b6]">
        <span>&copy; 2026 {APP_NAME}. Open source under MIT.</span>
        <div className="flex items-center gap-5">
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <Link href="/compliance" className="hover:text-white">Compliance</Link>
        </div>
      </footer>
    </div>
  )
}