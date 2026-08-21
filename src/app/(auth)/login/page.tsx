"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Fingerprint, Ship, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUserStore } from "@/store/user-store"
import { APP_NAME } from "@/lib/constants"

export default function LoginPage() {
  const [mode, setMode] = useState<"email" | "phone">("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const login = useUserStore((s) => s.login)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const identifier = mode === "email" ? email : phone
    if (!identifier || !password) { setError("Fill in all fields"); return }
    setLoading(true)
    try {
      const result = mode === "email"
        ? await login(email, password)
        : await login(phone, password)
      if (!result.success) { setError(result.error || "Login failed"); setLoading(false); return }
      router.push("/dashboard")
    } catch (err: any) {
      setError(err?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#071a26] relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(232,163,61,0.14)_0%,transparent_60%),radial-gradient(ellipse_40%_30%_at_0%_100%,rgba(45,212,191,0.07)_0%,transparent_60%)]" />
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="star" style={{
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
          opacity: Math.random() * 0.5 + 0.2,
          animationDelay: `${Math.random() * 5}s`, animationDuration: `${Math.random() * 3 + 2}s`,
        }} />
      ))}

      <div className="relative z-10 w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 text-[#8ea6b6] hover:text-white mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to {APP_NAME}
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-[#e8a33d] to-[#2dd4bf] items-center justify-center shadow-lg shadow-[#e8a33d]/30 mb-4">
            <Ship className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-[#8ea6b6] text-sm mt-1">Log in to your NovaPay account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-[#0e2633] rounded-xl p-1 border border-[#1e3d4d]">
            <button type="button" onClick={() => setMode("email")} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "email" ? "bg-[#e8a33d]/20 text-white" : "text-[#8ea6b6]"}`}>Email</button>
            <button type="button" onClick={() => setMode("phone")} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "phone" ? "bg-[#e8a33d]/20 text-white" : "text-[#8ea6b6]"}`}>Phone</button>
          </div>

          <Input
            type={mode === "email" ? "email" : "tel"}
            placeholder={mode === "email" ? "email@example.com" : "+91 99999 99999"}
            value={mode === "email" ? email : phone}
            onChange={(e) => mode === "email" ? setEmail(e.target.value) : setPhone(e.target.value)}
            className="bg-[#0e2633] border-[#1e3d4d] text-white placeholder:text-[#8ea6b6] focus:border-[#e8a33d]/50"
          />

          <div className="relative">
            <Input
              type={showPwd ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#0e2633] border-[#1e3d4d] text-white placeholder:text-[#8ea6b6] focus:border-[#e8a33d]/50 pr-10"
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8ea6b6] hover:text-[#8ea6b6]">
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Link href="/forgot-password" className="block text-xs text-[#e8a33d] hover:text-[#f2bd68] text-right">Forgot password?</Link>

          {error && <p className="text-sm text-[#f87171] bg-[#f87171]/10 rounded-lg p-3 border border-[#f87171]/20">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] hover:from-[#d18a24] hover:to-[#e0a64a] text-white border-0 shadow-lg shadow-[#e8a33d]/25 h-11">
            {loading ? "Logging in..." : "Log In"}
          </Button>

          <div className="relative">
            <div className="divider-cosmic my-4" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#071a26] px-3 text-xs text-[#8ea6b6]">or</span>
          </div>

          <Button variant="outline" disabled className="w-full border-[#1e3d4d] text-[#8ea6b6] gap-2">
            <Fingerprint className="h-4 w-4" /> Use Fingerprint
          </Button>

          <p className="text-center text-xs text-[#8ea6b6] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#f2bd68] hover:text-[#f6cf8f]">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
