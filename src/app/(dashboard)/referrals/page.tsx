"use client"
import { useState, useEffect } from "react"
import { Gift, Users, Share2, Copy, Check } from "lucide-react"

export default function ReferralsPage() {
  const [data, setData] = useState<any>(null); const [loading, setLoading] = useState(true); const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false)

  useEffect(() => {
    fetch("/api/referrals").then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const copyCode = () => { if (data?.referralCode) { navigator.clipboard.writeText(data.link || data.referralCode); setCopied(true); setTimeout(() => setCopied(false), 2000) } }
  const refer = async () => { await fetch("/api/referrals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); setSent(true) }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Refer & Earn</h1><p className="text-[#8ea6b6] text-sm">Invite friends, earn ₹500 each</p></div>
      {loading ? <div className="text-center text-[#8ea6b6] py-8">Loading...</div> : data && <>
        <div className="bg-gradient-to-r from-pink-900/40 to-zinc-900 rounded-2xl p-6 border border-[#1e3d4d] text-center">
          <Gift className="w-10 h-10 mx-auto text-pink-400 mb-2" />
          <p className="text-3xl font-bold text-white">₹{data.totalRewards}</p>
          <p className="text-[#8ea6b6] text-sm">Total referral earnings</p>
          <p className="text-[#8ea6b6] text-xs mt-1">{data.sent?.length || 0} friends joined</p>
        </div>
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d] text-center">
          <p className="text-[#8ea6b6] text-sm mb-2">Your referral code</p>
          <div className="flex items-center justify-center gap-3"><span className="text-2xl font-bold text-white tracking-widest">{data.referralCode}</span>
            <button onClick={copyCode} className="bg-[#0e2633] hover:bg-[#0e2633] p-2 rounded-lg">{copied ? <Check className="w-5 h-5 text-[#2dd4bf]" /> : <Copy className="w-5 h-5 text-[#8ea6b6]" />}</button>
          </div>
          <button onClick={copyCode} className="mt-3 bg-[#2dd4bf] text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mx-auto"><Share2 className="w-4 h-4" /> Share Link</button>
        </div>
        <div className="bg-[#0e2633] rounded-2xl p-6 border border-[#1e3d4d]">
          <h3 className="text-white font-semibold mb-3">Invite via email</h3>
          <div className="flex gap-2">{!sent ? <><input type="email" placeholder="friend@email.com" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 bg-[#0e2633] text-white rounded-lg px-4 py-2.5 text-sm border border-[#1e3d4d]" /><button onClick={refer} className="bg-[#2dd4bf] text-white px-4 py-2 rounded-lg text-sm">Send</button></> : <p className="text-[#2dd4bf] text-sm">✅ Invite sent!</p>}</div>
        </div>
        {data.sent?.length > 0 && <div className="space-y-2"><h3 className="text-white font-semibold">Recent Referrals</h3>{data.sent.map((r: any) => <div key={r.id} className="bg-[#0e2633] rounded-xl p-3 border border-[#1e3d4d] flex justify-between"><span className="text-white text-sm">{r.referee?.name || "Friend"}</span><span className="text-[#8ea6b6] text-xs">{new Date(r.createdAt).toLocaleDateString()}</span></div>)}</div>}
      </>}
    </div>
  )
}
