import Link from "next/link"
import { Ship, ArrowLeft } from "lucide-react"
import { APP_NAME } from "@/lib/constants"

export const metadata = {
  title: `Terms of Service — ${APP_NAME}`,
  description: "The terms governing your use of NovaPay.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#071a26]">
      <header className="border-b border-[#1e3d4d] sticky top-0 z-10 bg-[#071a26]/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
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

      <main className="max-w-4xl mx-auto px-5 py-12">
        <p className="text-xs font-semibold text-[#2dd4bf] uppercase tracking-wider mb-2">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Terms of Service</h1>
        <p className="text-sm text-[#8ea6b6] mt-2">Last updated: August 21, 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-[#c9d4de]">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance</h2>
            <p>
              By creating a NovaPay account you agree to these Terms, our Privacy Policy, and the
              master directions issued by the Reserve Bank of India (RBI) applicable to prepaid instruments,
              payment aggregators and banking partners.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Eligibility & KYC</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must be an Indian resident aged 18+ (or 10+ for minor accounts with guardian consent).</li>
              <li>Full services require completed KYC (Aadhaar OTP + PAN via DigiLocker/NSDL, and video verification).</li>
              <li>Providing false information is grounds for immediate account closure and reporting to authorities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Accounts, Limits & Fees</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Transaction limits follow RBI PPI/MPI rules and vary by KYC level.</li>
              <li>Domestic transfers: up to ₹1,00,000 per transaction. UPI daily limit ₹1,00,000.</li>
              <li>International spending/remittance follows FEMA & LRS (US$250,000/year), including TCS as applicable.</li>
              <li>Current fee schedule is published in-app; material changes are notified 30 days in advance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Security Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Keep your password, MPIN and OTPs confidential. NovaPay staff will never ask for them.</li>
              <li>Report unauthorised transactions within 3 working days for zero liability under RBI circular on customer protection.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Deposits & Safeguards</h2>
            <p>
              Customer funds are held in escrow accounts with scheduled commercial banks, segregated from NovaPay&apos;s
              own funds, per RBI guidelines. Balances may be insured by DICGC up to applicable limits where the product is a bank deposit.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Termination</h2>
            <p>
              You may close your account anytime from Settings. We may suspend/close accounts for fraud,
              regulatory violations, or inactivity after notice, subject to statutory retention requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Liability & Grievance</h2>
            <p>
              Our liability is limited except where RBI consumer-protection rules provide otherwise.
              Grievances: support@novapay.in (acknowledgment within 24h, resolution within 10 working days),
              escalation to RBI Banking Ombudsman thereafter.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Governing Law</h2>
            <p>These terms are governed by Indian law; courts at Bangalore, Karnataka have exclusive jurisdiction.</p>
          </section>
        </div>

        <footer className="mt-16 pt-8 border-t border-[#1e3d4d] flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#8ea6b6]">
          <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/compliance" className="hover:text-white">Compliance & Certifications</Link>
        </footer>
      </main>
    </div>
  )
}