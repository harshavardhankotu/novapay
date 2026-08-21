import Link from "next/link"
import { Ship, ArrowLeft, ShieldCheck, Lock, Landmark, FileCheck, Server, BadgeCheck, Fingerprint } from "lucide-react"
import { APP_NAME } from "@/lib/constants"

export const metadata = {
  title: `Compliance & Certifications — ${APP_NAME}`,
  description: "Regulatory licenses, security certifications and audit practices at NovaPay.",
}

const licenses = [
  { icon: Landmark, title: "RBI Authorisation", desc: "Semi-closed PPI authorisation & PA/PG licence under the Payment and Settlement Systems Act, 2007." },
  { icon: FileCheck, title: "FIU-IND Registered", desc: "Registered Reporting Entity under the Prevention of Money Laundering Act (PMLA)." },
  { icon: ShieldCheck, title: "UPI via NPCI", desc: "TPAP on-boarded with sponsor bank members for UPI collect & intent flows." },
  { icon: Server, title: "RBI Data Localisation", desc: "End-to-end payment system data stored only in India, audited annually (SCDA circular DPSS.CO.OD No.2785/06.08.005/2018-19)." },
]

const certifications = [
  { icon: Lock, title: "PCI-DSS v4.0", desc: "Level 1 certification for card data handling. Annual QSA audit; quarterly ASV scans." },
  { icon: BadgeCheck, title: "ISO/IEC 27001:2022", desc: "Information Security Management System certified across engineering & operations." },
  { icon: Fingerprint, title: "ISO/IEC 27701", desc: "Privacy Information Management aligned with India's DPDP Act, 2023." },
]

const practices = [
  { title: "Encryption everywhere", desc: "TLS 1.3 in transit; AES-256-GCM at rest; HSM-backed key management with automatic rotation." },
  { title: "Independent audits", desc: "Annual SOC 2 Type II audit, CERT-In empanelled penetration testing every 6 months, and a public bug-bounty program." },
  { title: "Segregation of funds", desc: "Customer money sits in escrow accounts with scheduled commercial banks — never commingled with company funds." },
  { title: "Fraud & AML engine", desc: "Real-time transaction monitoring, device fingerprinting, velocity checks, and automated STR filing to FIU-IND." },
  { title: "Grievance redressal", desc: "24h acknowledgment / 10-day resolution TAT per RBI (Internal Ombudsman framework), then RBI Banking Ombudsman escalation." },
]

export default function CompliancePage() {
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
        <p className="text-xs font-semibold text-[#2dd4bf] uppercase tracking-wider mb-2">Trust Centre</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Compliance & Certifications</h1>
        <p className="text-sm text-[#8ea6b6] mt-3 max-w-2xl leading-relaxed">
          {APP_NAME} operates as a regulated financial institution. Here is exactly how we&apos;re licensed,
          certified, and audited.
        </p>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-white mb-5">Regulatory Licences</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {licenses.map((l) => (
              <div key={l.title} className="p-5 rounded-2xl bg-[#0e2633] border border-[#1e3d4d] card-hover">
                <l.icon className="h-6 w-6 text-[#f2bd68] mb-3" />
                <h3 className="font-semibold text-white mb-1">{l.title}</h3>
                <p className="text-sm text-[#8ea6b6] leading-relaxed">{l.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-white mb-5">Security Certifications</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {certifications.map((c) => (
              <div key={c.title} className="p-5 rounded-2xl bg-gradient-to-br from-[#062c3a]/60 to-transparent border border-[#1e3d4d]">
                <c.icon className="h-6 w-6 text-[#2dd4bf] mb-3" />
                <h3 className="font-semibold text-white text-sm mb-1">{c.title}</h3>
                <p className="text-xs text-[#8ea6b6] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-white mb-5">How We Protect Your Money</h2>
          <div className="space-y-3">
            {practices.map((p, i) => (
              <div key={p.title} className="flex items-start gap-4 p-4 rounded-xl bg-[#0e2633]/50 border border-[#1e3d4d]">
                <span className="h-7 w-7 rounded-lg bg-[#e8a33d]/15 text-[#f2bd68] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-semibold text-white text-sm">{p.title}</h3>
                  <p className="text-sm text-[#8ea6b6] mt-0.5 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 p-6 rounded-2xl bg-[#e8a33d]/10 border border-[#e8a33d]/20">
          <h2 className="font-semibold text-white mb-2">Note on this deployment</h2>
          <p className="text-sm text-[#c9d4de] leading-relaxed">
            This repository is a demonstration build. Regulatory licences, PCI-DSS scope and ISO certificates
            described here represent the production architecture of a real fintech operation and are shown for
            completeness of the compliance surface — verify actual certificate numbers before production use.
          </p>
        </section>

        <footer className="mt-16 pt-8 border-t border-[#1e3d4d] flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#8ea6b6]">
          <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/compliance" className="hover:text-white">Compliance & Certifications</Link>
        </footer>
      </main>
    </div>
  )
}