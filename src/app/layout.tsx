import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { AuthProvider } from "@/components/auth-provider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://novapay.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "NovaPay — The Open-Source Digital Banking Platform",
    template: "%s | NovaPay",
  },
  description:
    "Production-grade fintech starter kit: OTP auth, eKYC verification, working ledger, 47 screens, 40+ API routes. Free, open source, runs on ₹0/month.",
  keywords: ["open source banking", "fintech starter kit", "next.js banking", "UPI app template", "digital bank clone", "neobank open source"],
  openGraph: {
    type: "website",
    siteName: "NovaPay",
    title: "NovaPay — The Open-Source Digital Banking Platform",
    description:
      "Full-stack fintech starter kit with OTP auth, eKYC, ledger & 47 screens. MIT licensed. Try the live demo in one click.",
    url: SITE,
  },
  twitter: {
    card: "summary_large_image",
    title: "NovaPay — The Open-Source Digital Banking Platform",
    description: "Full-stack fintech starter kit with OTP auth, eKYC, ledger & 47 screens. MIT licensed.",
  },
}

export const viewport: Viewport = {
  themeColor: "#071a26",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body suppressHydrationWarning className="min-h-screen antialiased scroll-smooth">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
