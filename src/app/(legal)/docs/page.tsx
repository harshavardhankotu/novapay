import Link from "next/link"
import { Ship, ArrowLeft, Terminal, FolderTree, Boxes, Rocket, BookOpen, ShieldCheck } from "lucide-react"
import { APP_NAME, GITHUB_URL } from "@/lib/constants"

export const metadata = {
  title: `Docs — ${APP_NAME}`,
  description: "Setup, architecture and deployment guide for the NovaPay open-source banking platform.",
}

const quickStart = [
  { cmd: "git clone https://github.com/harshavardhankotu/novapay.git && cd novapay", desc: "Clone the repository" },
  { cmd: "npm install", desc: "Install dependencies" },
  { cmd: "npx prisma db push", desc: "Create the SQLite schema (dev.db)" },
  { cmd: "npm run seed", desc: "Seed a fully populated demo account" },
  { cmd: "npm run dev", desc: "Start on http://localhost:3000" },
]

const structure = [
  { path: "src/app/(auth)/", desc: "Login (OTP), signup, KYC eKYC, forgot-password flows" },
  { path: "src/app/(dashboard)/", desc: "47 product screens: accounts, cards, UPI, transfers, forex, wealth…" },
  { path: "src/app/api/", desc: "40+ route handlers — one REST surface per module" },
  { path: "src/app/(legal)/", desc: "Privacy, Terms, Compliance centre, Pricing" },
  { path: "src/components/", desc: "UI kit, layout shell, chatbot, onboarding, security widgets" },
  { path: "src/lib/", desc: "Auth (JWT/bcrypt), validation (Verhoeff/PAN/phone), prisma client, i18n" },
  { path: "prisma/", desc: "Schema + self-seeding demo data generator" },
  { path: "__tests__/", desc: "Vitest suites for auth & validation" },
]

const featureMatrix = [
  { area: "Authentication", items: "Email/phone login · OTP challenge with lockout · bcrypt · HttpOnly JWT cookies" },
  { area: "KYC / Identity", items: "Aadhaar Verhoeff checksum · PAN regex · duplicate detection · masked storage · DigiLocker-style OTP flow" },
  { area: "Ledger", items: "Atomic transfers · bill payments debit balances · transaction history · categories" },
  { area: "Banking modules", items: "Accounts, cards, UPI IDs, beneficiaries, mandates, FDs, RDs, loans, pockets" },
  { area: "Wealth", items: "Mutual funds, digital gold, crypto holdings, credit score, RuPay credit line" },
  { area: "Lifestyle", items: "Budgeting + insights, family/kids accounts, eSIM, LRS remittances, disputes, referrals" },
  { area: "Platform", items: "PWA manifest, i18n provider (6 Indic languages), rate limiting, audit logs, sessions, 2FA UI" },
]

const deploySteps = [
  { step: "1", title: "Create a free Turso database", code: "turso db create novapay\nturso db show novapay --url\nturso db tokens create novapay" },
  { step: "2", title: "Point Prisma at it (.env)", code: 'DATABASE_URL="libsql://<your-db>.turso.io"\nLIBSQL_AUTH_TOKEN="<your-token>"' },
  { step: "3", title: "Deploy to Vercel Hobby (free)", code: "npm i -g vercel\nvercel --prod" },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#071a26]">
      <header className="border-b border-[#1e3d4d] sticky top-0 z-10 bg-[#071a26]/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#e8a33d] to-[#2dd4bf] flex items-center justify-center">
              <Ship className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">{APP_NAME} Docs</span>
          </Link>
          <div className="flex items-center gap-4">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-[#8ea6b6] hover:text-white">GitHub</a>
            <Link href="/" className="text-sm text-[#8ea6b6] hover:text-white flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-12 space-y-14">
        {/* Quick start */}
        <section>
          <h2 className="flex items-center gap-2.5 text-xl font-bold text-white mb-5">
            <Terminal className="h-5 w-5 text-[#f2bd68]" /> Quick Start
          </h2>
          <div className="space-y-3">
            {quickStart.map((q) => (
              <div key={q.cmd} className="rounded-xl border border-[#1e3d4d] bg-[#0e2633]/60 overflow-hidden">
                <code className="block px-4 py-3 text-sm text-[#8be9c8] font-mono overflow-x-auto">$ {q.cmd}</code>
                <p className="px-4 py-2 text-xs text-[#8ea6b6] border-t border-[#1e3d4d]/50">{q.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-[#8ea6b6] mt-4">
            Demo credentials after seeding: <code className="text-[#2dd4bf] font-mono">test@novapay.in</code> /{" "}
            <code className="text-[#2dd4bf] font-mono">Test@1234</code> — or click “Try Live Demo” which seeds automatically.
          </p>
        </section>

        {/* Architecture */}
        <section>
          <h2 className="flex items-center gap-2.5 text-xl font-bold text-white mb-5">
            <FolderTree className="h-5 w-5 text-[#f2bd68]" /> Project Structure
          </h2>
          <div className="rounded-2xl border border-[#1e3d4d] divide-y divide-[#1e3d4d]/60 overflow-hidden">
            {structure.map((s) => (
              <div key={s.path} className="grid sm:grid-cols-[240px_1fr] gap-1 sm:gap-4 px-4 py-3 bg-[#0e2633]/30">
                <code className="text-sm text-[#2dd4bf] font-mono">{s.path}</code>
                <p className="text-sm text-[#8ea6b6]">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature matrix */}
        <section>
          <h2 className="flex items-center gap-2.5 text-xl font-bold text-white mb-5">
            <Boxes className="h-5 w-5 text-[#f2bd68]" /> Feature Matrix
          </h2>
          <div className="rounded-2xl border border-[#1e3d4d] divide-y divide-[#1e3d4d]/60 overflow-hidden">
            {featureMatrix.map((f) => (
              <div key={f.area} className="grid sm:grid-cols-[180px_1fr] gap-1 sm:gap-4 px-4 py-3 bg-[#0e2633]/30">
                <p className="text-sm font-semibold text-white">{f.area}</p>
                <p className="text-sm text-[#8ea6b6] leading-relaxed">{f.items}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Deploy free */}
        <section>
          <h2 className="flex items-center gap-2.5 text-xl font-bold text-white mb-5">
            <Rocket className="h-5 w-5 text-[#f2bd68]" /> Deploy for ₹0/month
          </h2>
          <p className="text-sm text-[#8ea6b6] mb-5 max-w-2xl leading-relaxed">
            The whole platform runs inside free tiers. SQLite locally; libSQL in production — the Prisma adapter is already wired.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {deploySteps.map((d) => (
              <div key={d.step} className="rounded-2xl border border-[#1e3d4d] bg-[#0e2633]/60 p-5">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8a33d]/15 text-[#f2bd68] text-xs font-bold mb-3">
                  {d.step}
                </span>
                <p className="text-sm font-semibold text-white mb-3">{d.title}</p>
                <pre className="text-[11px] leading-relaxed text-[#8be9c8] font-mono whitespace-pre-wrap break-all">{d.code}</pre>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance note */}
        <section className="rounded-2xl p-6 bg-gradient-to-br from-[#e8a33d]/10 to-transparent border border-[#e8a33d]/25">
          <h2 className="flex items-center gap-2.5 text-lg font-bold text-white mb-3">
            <ShieldCheck className="h-5 w-5 text-[#f2bd68]" /> Simulation Notice
          </h2>
          <p className="text-sm text-[#c9d4de] leading-relaxed">
            Money movement, KYC verification and external rails (NPCI/UIDAI/NSDL) are simulated so the platform stays
            licence-free and cost-free to run. Swap in real providers via the documented adapter points when you have
            regulatory cover — everything else (auth, ledger integrity, validation logic, UX) is production-grade today.
          </p>
        </section>

        <section className="flex flex-wrap gap-3">
          <Link href="/pricing">
            <span className="inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] text-[#1a1206] text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity">
              <BookOpen className="h-4 w-4" /> See Pricing
            </span>
          </Link>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <span className="inline-flex items-center gap-2 px-5 h-11 rounded-xl border border-[#1e3d4d] text-white text-sm font-semibold cursor-pointer hover:border-[#e8a33d]/40 transition-colors">
              View Source on GitHub
            </span>
          </a>
        </section>
      </main>

      <footer className="border-t border-[#1e3d4d]/50 px-5 py-6 max-w-5xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#8ea6b6]">
        <span>&copy; 2026 {APP_NAME}. Open source under MIT.</span>
        <div className="flex items-center gap-5">
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <Link href="/pricing" className="hover:text-white">Pricing</Link>
        </div>
      </footer>
    </div>
  )
}