import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"

/** GET /api/v1/balance?accountId= — scope: balance.read */
export async function GET(request: Request) {
  const auth = await authenticateApiKey(request, "balance.read")
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status! })

  const accountId = new URL(request.url).searchParams.get("accountId")
  if (!accountId) return NextResponse.json({ error: "accountId query param required" }, { status: 400 })

  // Scoped by key.userId — a key can only ever read its own linked user's data.
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId: auth.ctx!.userId, isActive: true },
    select: { balance: true, currency: true },
  })
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 })

  return NextResponse.json({ accountId, balance: account.balance, currency: account.currency, asOf: new Date().toISOString() })
}