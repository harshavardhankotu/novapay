"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Ship, ArrowLeft, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUserStore } from "@/store/user-store"
import { APP_NAME } from "@/lib/constants"

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Lowercase", pass: /[a-z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special char", pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length

  return (
    <div className="space-y-1.5">
      <div className="h-1 rounded-full bg-[#1e3d4d] overflow-hidden">
        <div className={`h-full transition-all duration-300 rounded-full ${
          score <= 2 ? "bg-[#f87171]" : score <= 3 ? "bg-[#fbbf24]" : "bg-[#4ade80]"
        }`} style={{ width: `${(score / 5) * 100}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-1.5">
            {c.pass ? <Check className="h-3 w-3 text-[#4ade80]" /> : <X className="h-3 w-3 text-[#8ea6b6]" />}
            <span className="text-[10px] text-[#8ea6b6]">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SignupPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", password: "", confirmPassword: "" })
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const signup = useUserStore((s) => s.signup)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!form.firstName || !form.lastName || !form.phone || !form.email || !form.password) {
      setError("All fields are required"); return
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match"); return
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters"); return
    }
    setLoading(true)
    try {
      const result = await signup(
        `${form.firstName} ${form.lastName}`,
        form.email,
        form.phone,
        form.password,
      )
      if (!result.success) { setError(result.error || "Signup failed"); setLoading(false); return }
      router.push("/kyc")
    } catch (err: any) {
      setError(err?.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#071a26] relative overflow-hidden px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(232,163,61,0.14)_0%,transparent_60%),radial-gradient(ellipse_40%_30%_at_100%_100%,rgba(45,212,191,0.07)_0%,transparent_60%)]" />
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

        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-[#e8a33d] to-[#2dd4bf] items-center justify-center shadow-lg shadow-[#e8a33d]/30 mb-4">
            <Ship className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-[#8ea6b6] text-sm mt-1">Join the future of banking</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="First Name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className="bg-[#0e2633] border-[#1e3d4d] text-white placeholder:text-[#8ea6b6] focus:border-[#e8a33d]/50" />
            <Input placeholder="Last Name" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className="bg-[#0e2633] border-[#1e3d4d] text-white placeholder:text-[#8ea6b6] focus:border-[#e8a33d]/50" />
          </div>
          <Input type="tel" placeholder="+91 99999 99999" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="bg-[#0e2633] border-[#1e3d4d] text-white placeholder:text-[#8ea6b6] focus:border-[#e8a33d]/50" />
          <Input type="email" placeholder="email@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} className="bg-[#0e2633] border-[#1e3d4d] text-white placeholder:text-[#8ea6b6] focus:border-[#e8a33d]/50" />
          <div className="relative">
            <Input type={showPwd ? "text" : "password"} placeholder="Password" value={form.password} onChange={(e) => update("password", e.target.value)} className="bg-[#0e2633] border-[#1e3d4d] text-white placeholder:text-[#8ea6b6] focus:border-[#e8a33d]/50 pr-10" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8ea6b6] hover:text-[#8ea6b6]">
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrength password={form.password} />
          <Input type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} className="bg-[#0e2633] border-[#1e3d4d] text-white placeholder:text-[#8ea6b6] focus:border-[#e8a33d]/50" />

          {error && <p className="text-sm text-[#f87171] bg-[#f87171]/10 rounded-lg p-3 border border-[#f87171]/20">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] hover:from-[#d18a24] hover:to-[#e0a64a] text-white border-0 shadow-lg shadow-[#e8a33d]/25 h-11">
            {loading ? "Creating account..." : "Create Account"}
          </Button>

          <p className="text-[10px] text-[#8ea6b6] text-center leading-relaxed">
            By signing up, you agree to our{" "}
            <Link href="#" className="text-[#e8a33d] hover:text-[#f2bd68]">Terms</Link> and{" "}
            <Link href="#" className="text-[#e8a33d] hover:text-[#f2bd68]">Privacy Policy</Link>.
            {APP_NAME} is regulated by RBI.
          </p>

          <p className="text-center text-xs text-[#8ea6b6]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#f2bd68] hover:text-[#f6cf8f]">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
