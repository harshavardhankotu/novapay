"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Smartphone, Mail, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [method, setMethod] = useState<"phone" | "email">("phone")

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Log in to your Revolut India account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6 bg-[#f8f9fa] dark:bg-[#2d3436] rounded-lg p-1">
            <button
              onClick={() => setMethod("phone")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                method === "phone" ? "bg-white dark:bg-[#1a1a2e] shadow-sm" : "text-[#636e72]"
              }`}
            >
              <Smartphone className="h-4 w-4" /> Phone
            </button>
            <button
              onClick={() => setMethod("email")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                method === "email" ? "bg-white dark:bg-[#1a1a2e] shadow-sm" : "text-[#636e72]"
              }`}
            >
              <Mail className="h-4 w-4" /> Email
            </button>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-sm font-medium mb-1 block">
                {method === "phone" ? "Phone Number" : "Email Address"}
              </label>
              <Input
                type={method === "phone" ? "tel" : "email"}
                placeholder={method === "phone" ? "+91 98765 43210" : "you@example.com"}
              />
            </div>
            <Button className="w-full" size="lg">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-[#636e72] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#6c5ce7] font-medium hover:underline">Sign Up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
