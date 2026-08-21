"use client"
import { useState } from "react"
import { Calculator, IndianRupee, Percent, Calendar } from "lucide-react"

export default function CalculatorsPage() {
  const [tab, setTab] = useState<"emi" | "fd" | "sip">("emi")
  const [emiP, setEmiP] = useState("100000"); const [emiR, setEmiR] = useState("10.99"); const [emiN, setEmiN] = useState("24")
  const [fdP, setFdP] = useState("100000"); const [fdR, setFdR] = useState("7.5"); const [fdN, setFdN] = useState("12")
  const [sipA, setSipA] = useState("5000"); const [sipR, setSipR] = useState("12"); const [sipN, setSipN] = useState("60")

  const calcEMI = (p: number, r: number, n: number) => {
    const mr = r / 100 / 12
    return p * mr * Math.pow(1 + mr, n) / (Math.pow(1 + mr, n) - 1)
  }

  const calcFD = (p: number, r: number, n: number) => {
    return p * Math.pow(1 + (r / 100) / 4, 4 * n / 12)
  }

  const calcSIP = (a: number, r: number, n: number) => {
    const mr = r / 100 / 12
    return a * ((Math.pow(1 + mr, n) - 1) / mr) * (1 + mr)
  }

  const emi = calcEMI(parseFloat(emiP) || 0, parseFloat(emiR) || 0, parseFloat(emiN) || 1)
  const fdMaturity = calcFD(parseFloat(fdP) || 0, parseFloat(fdR) || 0, parseFloat(fdN) || 1)
  const sipValue = calcSIP(parseFloat(sipA) || 0, parseFloat(sipR) || 0, parseFloat(sipN) || 1)

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Calculators</h1><p className="text-[#8ea6b6] text-sm">Plan your finances</p></div>
      <div className="flex gap-2">{["emi","fd","sip"].map(t => <button key={t} onClick={() => setTab(t as any)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? "bg-[#2dd4bf] text-white" : "bg-[#0e2633] text-[#8ea6b6]"}`}>{t === "emi" ? "Loan EMI" : t.toUpperCase()}</button>)}</div>
      {tab === "emi" && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-4">
          <div className="flex items-center gap-2"><IndianRupee className="w-5 h-5 text-[#2dd4bf]" /><span className="text-white font-semibold">Loan EMI Calculator</span></div>
          <input type="number" placeholder="Loan amount (₹)" value={emiP} onChange={e => setEmiP(e.target.value)} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <div className="grid grid-cols-2 gap-3"><input type="number" placeholder="Interest rate (%)" value={emiR} onChange={e => setEmiR(e.target.value)} className="bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" /><input type="number" placeholder="Tenure (months)" value={emiN} onChange={e => setEmiN(e.target.value)} className="bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" /></div>
          <div className="bg-[#0e2633]/50 rounded-xl p-4 text-center"><p className="text-[#8ea6b6] text-sm">Monthly EMI</p><p className="text-3xl font-bold text-white">₹{Math.round(emi).toLocaleString("en-IN")}</p><p className="text-[#8ea6b6] text-xs mt-1">Total interest: ₹{Math.round(emi * parseFloat(emiN) - parseFloat(emiP)).toLocaleString("en-IN")}</p></div>
        </div>
      )}
      {tab === "fd" && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-4">
          <div className="flex items-center gap-2"><Percent className="w-5 h-5 text-[#2dd4bf]" /><span className="text-white font-semibold">FD Calculator</span></div>
          <input type="number" placeholder="Deposit amount (₹)" value={fdP} onChange={e => setFdP(e.target.value)} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <div className="grid grid-cols-2 gap-3"><input type="number" placeholder="Interest rate (%)" value={fdR} onChange={e => setFdR(e.target.value)} className="bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" /><input type="number" placeholder="Tenure (months)" value={fdN} onChange={e => setFdN(e.target.value)} className="bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" /></div>
          <div className="bg-[#0e2633]/50 rounded-xl p-4 text-center"><p className="text-[#8ea6b6] text-sm">Maturity Amount</p><p className="text-3xl font-bold text-white">₹{Math.round(fdMaturity).toLocaleString("en-IN")}</p><p className="text-[#2dd4bf] text-xs mt-1">Earnings: ₹{Math.round(fdMaturity - parseFloat(fdP)).toLocaleString("en-IN")}</p></div>
        </div>
      )}
      {tab === "sip" && (
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] space-y-4">
          <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-400" /><span className="text-white font-semibold">SIP Calculator</span></div>
          <input type="number" placeholder="Monthly investment (₹)" value={sipA} onChange={e => setSipA(e.target.value)} className="w-full bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" />
          <div className="grid grid-cols-2 gap-3"><input type="number" placeholder="Expected return (%)" value={sipR} onChange={e => setSipR(e.target.value)} className="bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" /><input type="number" placeholder="Duration (months)" value={sipN} onChange={e => setSipN(e.target.value)} className="bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" /></div>
          <div className="bg-[#0e2633]/50 rounded-xl p-4 text-center"><p className="text-[#8ea6b6] text-sm">Expected Value</p><p className="text-3xl font-bold text-white">₹{Math.round(sipValue).toLocaleString("en-IN")}</p><p className="text-purple-400 text-xs mt-1">Invested: ₹{(parseFloat(sipA) * parseFloat(sipN)).toLocaleString("en-IN")}</p></div>
        </div>
      )}
    </div>
  )
}
