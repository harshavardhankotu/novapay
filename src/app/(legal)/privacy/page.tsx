import Link from "next/link"
import { Ship, ArrowLeft } from "lucide-react"
import { APP_NAME } from "@/lib/constants"

export const metadata = {
  title: `Privacy Policy — ${APP_NAME}`,
  description: "How NovaPay collects, uses, and protects your data.",
}

export default function PrivacyPage() {
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
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Privacy Policy</h1>
        <p className="text-sm text-[#8ea6b6] mt-2">Last updated: August 21, 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-[#c9d4de]">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Identity & KYC data:</strong> name, phone number, email, PAN, Aadhaar (verified via DigiLocker/UIDAI; stored masked), video-KYC recordings.</li>
              <li><strong>Financial data:</strong> account balances, transaction history, UPI IDs, beneficiary details, budgets you create.</li>
              <li><strong>Device & usage data:</strong> device identifiers, IP address, session logs used for fraud detection.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. How We Use It</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Providing banking services — payments, transfers, cards, deposits.</li>
              <li>Regulatory compliance: RBI KYC Master Direction, PMLA reporting, FEMA/LRS checks.</li>
              <li>Fraud prevention and transaction monitoring.</li>
              <li>Service communications (transaction alerts via SMS/push/email).</li>
            </ul>
            <p className="mt-3">We never sell your personal data or use it for third-party advertising.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Data Storage & Security</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>All traffic is encrypted in transit (TLS 1.3); sensitive fields are encrypted at rest (AES-256).</li>
              <li>Aadhaar numbers are stored masked; full values exist only transiently during verification with UIDAI.</li>
              <li>Passwords are hashed with bcrypt and never recoverable in plaintext.</li>
              <li>Data residency: primary records are stored in Indian data centres per RBI data localisation rules.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Sharing</h2>
            <p>
              We share data only with: regulated partners required to deliver services (NPCI for UPI, card networks,
              banking partners), regulators when legally mandated (RBI, FIU-IND), and credit bureaus with your consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access and download your data anytime from Settings → Statements.</li>
              <li>Correct inaccurate profile information.</li>
              <li>Request account closure and erasure subject to statutory retention (typically 10 years under PMLA).</li>
              <li>Grievance redressal within RBI-mandated TATs — see our <Link href="/compliance" className="text-[#f2bd68] hover:text-[#f6cf8f]">Compliance</Link> page.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Cookies & Tracking</h2>
            <p>
              We use strictly necessary cookies for authentication sessions. No advertising trackers.
              Analytics are anonymised and aggregated.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Contact the Data Protection Officer</h2>
            <p>dpo@novapay.in · NovaPay Technologies Pvt. Ltd., Bangalore, India</p>
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