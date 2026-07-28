"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/store/user-store"
import { Smartphone, Mail, ArrowRight, Fingerprint, AlertCircle, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useUserStore()
  const [method, setMethod] = useState<"phone" | "email">("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await login(email, password)
    setLoading(false)

    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error || "Login failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#f8f9fc] to-white dark:from-[#0a0a14] dark:to-[#15152a]">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-lg shadow-[#5046e5]/20">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <h1 className="text-2xl font-bold mt-4">Welcome back</h1>
          <p className="text-sm text-[#636e72] mt-1">Log in to your Revolut India account</p>
        </div>

        <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-6 shadow-sm space-y-5">
          <div className="flex gap-1.5 bg-[#f5f6fa] dark:bg-[#1a1a30] rounded-xl p-1">
            {[
              { id: "email" as const, label: "Email", icon: Mail },
              { id: "phone" as const, label: "Phone", icon: Smartphone },
            ].map((opt) => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMethod(opt.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    method === opt.id
                      ? "bg-white dark:bg-[#0a0a14] shadow-sm text-[#1a1a2e] dark:text-white"
                      : "text-[#636e72] hover:text-[#1a1a2e] dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {opt.label}
                </button>
              )
            })}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {method === "email" ? (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]"
                  placeholder="you@example.com"
                />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]"
                  placeholder="+91 98765 43210"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full h-11 px-4 pr-10 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]"
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#636e72] hover:text-[#1a1a2e] dark:hover:text-white">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-[#5046e5] hover:underline">Forgot password?</Link>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#e17055]/5 border border-[#e17055]/20 text-sm text-[#e17055]">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button className="w-full" size="lg" disabled={loading}>
              {loading ? "Signing in..." : "Continue"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#e8eaed] dark:border-[#2a2a45]" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white dark:bg-[#15152a] px-2 text-[#636e72]">or</span></div>
          </div>

          <Button variant="outline" className="w-full gap-2" type="button" disabled>
            <Fingerprint className="h-4 w-4" />
            Use Fingerprint
          </Button>
        </div>

        <p className="text-center text-sm text-[#636e72] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#5046e5] font-medium hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}
