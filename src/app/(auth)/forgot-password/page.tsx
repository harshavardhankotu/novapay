"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle, Ship } from "lucide-react"
import { APP_NAME } from "@/lib/constants"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email) { setError("Enter your email address"); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-[#071a26] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(232,163,61,0.12)_0%,transparent_60%),radial-gradient(ellipse_40%_30%_at_100%_100%,rgba(45,212,191,0.06)_0%,transparent_60%)]" />
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="star" style={{
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
          opacity: Math.random() * 0.5 + 0.2,
          animationDelay: `${Math.random() * 5}s`, animationDuration: `${Math.random() * 3 + 2}s`,
        }} />
      ))}
      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#e8a33d] to-[#2dd4bf] flex items-center justify-center mx-auto shadow-lg shadow-[#e8a33d]/30">
            <Ship className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold mt-4 text-white">{sent ? "Check your email" : "Reset password"}</h1>
          <p className="text-sm text-[#8ea6b6] mt-1">
            {sent ? "We sent a reset link to your email" : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        <div className="bg-[#0e2633] rounded-2xl border border-[#1e3d4d] p-6 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-[#4ade80]/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-[#4ade80]" />
              </div>
              <p className="text-sm text-[#8ea6b6]">
                If an account exists with <strong className="text-white">{email}</strong>, you will receive a password reset email shortly.
              </p>
              <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
                Send again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-white">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-[#1e3d4d] bg-[#0e2633] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a33d]/30 focus:border-[#e8a33d]/50 placeholder:text-[#8ea6b6]"
                  placeholder="you@example.com"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#f87171]/10 border border-[#f87171]/20 text-sm text-[#f87171]">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <Button className="w-full" size="lg" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
                {!loading && <Send className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center mt-6">
          <Link href="/login" className="text-sm text-[#f2bd68] font-medium hover:text-[#f6cf8f] inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
