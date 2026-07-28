"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, ArrowRight } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join 450,000+ Indians already on the waitlist</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">First Name</label>
                <Input placeholder="Rahul" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Last Name</label>
                <Input placeholder="Kumar" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone Number</label>
              <Input type="tel" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input type="email" placeholder="rahul@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Password</label>
              <Input type="password" placeholder="Create a strong password" />
            </div>

            <div className="flex items-start gap-2 text-xs text-[#636e72]">
              <Shield className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Your data is encrypted and stored securely in India as per RBI guidelines.</span>
            </div>

            <Button className="w-full" size="lg">
              Create Account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-[#636e72] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#6c5ce7] font-medium hover:underline">Log In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
