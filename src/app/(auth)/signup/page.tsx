"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/store/user-store"
import { Shield, ArrowRight, AlertCircle, Eye, EyeOff, Check } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useUserStore()
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", password: "", confirmPassword: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  const passwordStrength = form.password.length >= 12 ? "strong" : form.password.length >= 8 ? "medium" : form.password.length > 0 ? "weak" : "none"
  const passwordsMatch = form.password === form.confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    const result = await signup(`${form.firstName} ${form.lastName}`, form.email, form.phone, form.password)
    setLoading(false)

    if (result.success) {
      router.push("/kyc")
    } else {
      setError(result.error || "Signup failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#f8f9fc] to-white dark:from-[#0a0a14] dark:to-[#15152a]">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-lg shadow-[#5046e5]/20">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <h1 className="text-2xl font-bold mt-4">Create your account</h1>
          <p className="text-sm text-[#636e72] mt-1">Join 450,000+ Indians on Revolut</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">First Name</label>
              <input value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]" placeholder="Rahul" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Last Name</label>
              <input value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]" placeholder="Kumar" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
            <input type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]" placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]" placeholder="rahul@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => updateField("password", e.target.value)} required minLength={8} className="w-full h-11 px-4 pr-10 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]" placeholder="Create a strong password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#636e72]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            {form.password.length > 0 && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex gap-1 flex-1">
                  {["weak", "medium", "strong"].map((level) => (
                    <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength === level || (passwordStrength === "medium" && (level === "weak" || level === "medium")) || (passwordStrength === "strong" && (level === "weak" || level === "medium" || level === "strong"))
                        ? level === "weak" ? "bg-[#e17055]" : level === "medium" ? "bg-[#fdcb6e]" : "bg-[#00b894]"
                        : "bg-[#e8eaed] dark:bg-[#2a2a45]"
                    }`} />
                  ))}
                </div>
                <span className="text-xs text-[#636e72] capitalize">{passwordStrength}</span>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} required minLength={8} className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]" placeholder="Re-enter password" />
            {form.confirmPassword.length > 0 && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${passwordsMatch ? "text-[#00b894]" : "text-[#e17055]"}`}>
                <Check className="h-3 w-3" />
                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
              </p>
            )}
          </div>

          <div className="flex items-start gap-2.5 text-xs text-[#636e72] bg-[#f5f6fa] dark:bg-[#1a1a30] rounded-xl p-3">
            <Shield className="h-4 w-4 mt-0.5 shrink-0 text-[#5046e5]" />
            <span>Your data is encrypted and stored in India as per RBI guidelines. We never share your data.</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#e17055]/5 border border-[#e17055]/20 text-sm text-[#e17055]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button className="w-full" size="lg" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>

        <p className="text-center text-sm text-[#636e72] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#5046e5] font-medium hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  )
}
