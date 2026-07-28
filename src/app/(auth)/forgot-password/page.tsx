"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from "lucide-react"

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
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#f8f9fc] to-white dark:from-[#0a0a14] dark:to-[#15152a]">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-lg shadow-[#5046e5]/20">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold mt-4">{sent ? "Check your email" : "Reset password"}</h1>
          <p className="text-sm text-[#636e72] mt-1">
            {sent ? "We sent a reset link to your email" : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-6 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-[#00b894]/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-[#00b894]" />
              </div>
              <p className="text-sm text-[#636e72]">
                If an account exists with <strong className="text-[#1a1a2e] dark:text-white">{email}</strong>, you will receive a password reset email shortly.
              </p>
              <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
                Send again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#e17055]/5 border border-[#e17055]/20 text-sm text-[#e17055]">
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
          <Link href="/login" className="text-sm text-[#5046e5] font-medium hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
