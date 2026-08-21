"use client"

import { SendMoneyForm } from "./send-form"

export default function TransfersPage() {
  return (
    <div className="animate-fade-in space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Transfers</h1>
        <p className="text-sm text-[#8ea6b6] mt-0.5">Send money instantly across India</p>
      </div>
      <SendMoneyForm />
    </div>
  )
}