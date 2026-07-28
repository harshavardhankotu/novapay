"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Smartphone, Mail, ArrowRight, Fingerprint } from "lucide-react"

export default function LoginPage() {
  const [method, setMethod] = useState<"phone" | "email">("phone")

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
              { id: "phone" as const, label: "Phone", icon: Smartphone },
              { id: "email" as const, label: "Email", icon: Mail },
            ].map((opt) => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.id}
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

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {method === "phone" ? "Phone Number" : "Email Address"}
              </label>
              <input
                type={method === "phone" ? "tel" : "email"}
                placeholder={method === "phone" ? "+91 98765 43210" : "you@example.com"}
                className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]"
              />
            </div>
            <Button className="w-full" size="lg">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#e8eaed] dark:border-[#2a2a45]" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white dark:bg-[#15152a] px-2 text-[#636e72]">or</span></div>
          </div>

          <Button variant="outline" className="w-full gap-2">
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
