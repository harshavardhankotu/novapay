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

export const metadata: Metadata = {
  title: "NovaPay - Finance Beyond Horizons",
  description:
    "India's most innovative digital banking platform. UPI, multi-currency accounts, budgeting, and more.",
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
