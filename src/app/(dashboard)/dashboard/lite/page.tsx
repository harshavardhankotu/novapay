import { prisma } from "@/lib/prisma"

const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`

export const dynamic = "force-dynamic"

/** LITE MODE — server-rendered, table-based, zero client JS. */
export default async function LiteDashboard() {
  // Auth is enforced by middleware before we get here.
  const h = await import("next/headers")
  const cookie = (await h.headers()).get("cookie") || ""
  const match = cookie.match(/token=([^;]+)/)

  let rows: { date: string; desc: string; amount: number }[] = []
  let balance = 0
  let name = "User"

  if (match) {
    const { verifyToken } = await import("@/lib/auth")
    const payload = verifyToken(decodeURIComponent(match[1]))
    if (payload) {
      name = payload.name
      const accounts = await prisma.account.findMany({ where: { userId: payload.userId, isActive: true } })
      balance = accounts.reduce((s, a) => s + a.balance, 0)
      const txns = await prisma.transaction.findMany({
        where: { accountId: { in: accounts.map((a) => a.id) }, status: "COMPLETED" },
        orderBy: { timestamp: "desc" },
        take: 20,
      })
      rows = txns.map((t) => ({
        date: new Date(t.timestamp).toLocaleDateString("en-IN"),
        desc: t.description || t.reference || t.category || "Transaction",
        amount: t.amount,
      }))
    }
  }

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: 18 }}>NovaPay — Lite</h1>
      <p>Hello {name}. Total balance: <strong>{money(balance)}</strong></p>

      <h2 style={{ fontSize: 14, marginTop: 20 }}>Recent transactions</h2>
      <table border={1} cellPadding={6} style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            <th align="left">Date</th>
            <th align="left">Description</th>
            <th align="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.date}</td>
              <td>{r.desc}</td>
              <td align="right" style={{ color: r.amount >= 0 ? "#0a7a4d" : "#b3372e" }}>
                {r.amount >= 0 ? "+" : ""}{money(r.amount)}
              </td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={3}>No transactions</td></tr>}
        </tbody>
      </table>

      <p style={{ marginTop: 16, fontSize: 11, color: "#777" }}>
        Lite mode: minimal data, no JavaScript features. <a href="/dashboard">Full version →</a>
      </p>
    </div>
  )
}