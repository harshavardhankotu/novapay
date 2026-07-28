"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, ArrowRight, ChevronLeft } from "lucide-react"

export default function SignupPage() {
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

        <div className="bg-white dark:bg-[#15152a] rounded-2xl border border-[#e8eaed] dark:border-[#2a2a45] p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">First Name</label>
              <input className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]" placeholder="Rahul" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Last Name</label>
              <input className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]" placeholder="Kumar" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
            <input type="tel" className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]" placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <input type="email" className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]" placeholder="rahul@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <input type="password" className="w-full h-11 px-4 rounded-xl border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#5046e5]/30 focus:border-[#5046e5] placeholder:text-[#636e72]" placeholder="Create a strong password" />
          </div>

          <div className="flex items-start gap-2.5 text-xs text-[#636e72] bg-[#f5f6fa] dark:bg-[#1a1a30] rounded-xl p-3">
            <Shield className="h-4 w-4 mt-0.5 shrink-0 text-[#5046e5]" />
            <span>Your data is encrypted and stored in India as per RBI guidelines. We never share your data.</span>
          </div>

          <Button className="w-full" size="lg">
            Create Account <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <p className="text-center text-sm text-[#636e72] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#5046e5] font-medium hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  )
}
