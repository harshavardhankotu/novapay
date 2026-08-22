import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"

/** GET /api/v1/accounts — scope: accounts.read */
export async function GET(request: Request) {
  const auth = await authenticateApiKey(request, "accounts.read")
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status! })

  const accounts = await prisma.account.findMany({
    where: { userId: auth.ctx!.userId, isActive: true },
    select: { id: true, type: true, currency: true, accountNumber: true },
  })
  return NextResponse.json({
    data: accounts.map((a) => ({ ...a, accountNumber: `****${a.accountNumber.slice(-4)}` })),
  })
}