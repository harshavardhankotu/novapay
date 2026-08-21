"use client"
import { useState, useEffect } from "react"
import { Bell, CheckCheck, Info, AlertTriangle, Gift, CreditCard, ArrowUpDown } from "lucide-react"

const typeIcons: Record<string, any> = { info: Info, alert: AlertTriangle, promotion: Gift, transaction: ArrowUpDown, card: CreditCard }

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]); const [unread, setUnread] = useState(0); const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/notifications").then(r => r.json()).then(d => { setNotifications(d.notifications || []); setUnread(d.unread); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    const res = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ readAll: true }) })
    if (res.ok) { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); setUnread(0) }
  }

  const markRead = async (id: string) => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnread(u => Math.max(0, u - 1))
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Notifications</h1><p className="text-[#8ea6b6] text-sm">{unread} unread</p></div>
        {unread > 0 && <button onClick={markAllRead} className="text-[#2dd4bf] text-sm flex items-center gap-1"><CheckCheck className="w-4 h-4" /> Mark all read</button>}
      </div>
      {loading ? <div className="text-center text-[#8ea6b6] py-8">Loading...</div> :
        notifications.length === 0 ? <div className="bg-[#0e2633] rounded-2xl p-8 text-center border border-[#1e3d4d]"><Bell className="w-12 h-12 mx-auto text-[#8ea6b6] mb-3" /><p className="text-[#8ea6b6]">No notifications</p></div> :
        notifications.map(n => {
          const Icon = typeIcons[n.type] || Bell
          return <div key={n.id} className={`bg-[#0e2633] rounded-2xl p-4 border cursor-pointer ${n.read ? "border-[#1e3d4d]" : "border-[#2dd4bf]/30"}`} onClick={() => !n.read && markRead(n.id)}>
            <div className="flex items-start gap-3"><Icon className={`w-5 h-5 mt-0.5 ${n.read ? "text-[#8ea6b6]" : "text-[#2dd4bf]"}`} /><div className="flex-1"><p className={`text-sm ${n.read ? "text-[#8ea6b6]" : "text-white font-medium"}`}>{n.title}</p><p className="text-[#8ea6b6] text-xs mt-0.5">{n.body}</p><p className="text-[#8ea6b6] text-xs mt-1">{new Date(n.createdAt).toLocaleDateString()} · {n.channel}</p></div></div>
          </div>
        })}
    </div>
  )
}
