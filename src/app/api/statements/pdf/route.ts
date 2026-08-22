import { getTokenFromCookies, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import PDFDocument from "pdfkit"

export const runtime = "nodejs"

/**
 * GET /api/statements/pdf?accountId=...&months=3
 * Real downloadable PDF statement with a running balance column.
 */
export async function GET(request: Request) {
  const token = getTokenFromCookies(request)
  if (!token) return new Response("Unauthorized", { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return new Response("Invalid token", { status: 401 })

  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get("accountId")
  const months = Math.min(24, Math.max(1, parseInt(searchParams.get("months") || "3", 10) || 3))

  const account = await prisma.account.findFirst({
    where: { id: accountId ?? undefined, userId: payload.userId },
  })
  if (!account) return new Response("Account not found", { status: 404 })

  const since = new Date()
  since.setMonth(since.getMonth() - months)

  // Chronological order so the running balance accumulates correctly.
  const txns = await prisma.transaction.findMany({
    where: { accountId: account.id, timestamp: { gte: since }, status: "COMPLETED" },
    orderBy: { timestamp: "asc" },
  })

  // Opening balance = current balance minus the sum of everything listed here.
  const listedTotal = txns.reduce((s, t) => s + t.amount, 0)
  let running = Math.round((account.balance - listedTotal) * 100) / 100
  const openingBalance = running

  const doc = new PDFDocument({ margin: 40, size: "A4" })
  const chunks: Buffer[] = []
  doc.on("data", (c: Buffer) => chunks.push(c))
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))))

  // Header
  doc.fontSize(20).fillColor("#0a3a4d").text("NovaPay", { continued: false })
  doc.moveDown(0.2).fontSize(10).fillColor("#555")
    .text(`Statement of Account · ${months} month${months > 1 ? "s" : ""}`)
  doc.moveDown(0.5).fontSize(9).fillColor("#333")
    .text(`${payload.name}`)
    .text(`${account.type} A/c ····${account.accountNumber.slice(-6)}  |  IFSC ${account.ifsc}  |  ${account.currency}`)
    .text(`Period: ${since.toLocaleDateString("en-IN")} – ${new Date().toLocaleDateString("en-IN")}`)
  doc.moveDown(0.5)

  // Table header
  const colX = [40, 110, 300, 400, 470]
  const drawHeader = () => {
    doc.rect(40, doc.y, 515, 18).fill("#071a26")
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8)
    doc.text("DATE", colX[0] + 4, doc.y + 5)
    doc.text("REFERENCE / DESCRIPTION", colX[1], doc.y + 5)
    doc.text("DEBIT", colX[2], doc.y + 5, { width: 60, align: "right" })
    doc.text("CREDIT", colX[3], doc.y + 5, { width: 60, align: "right" })
    doc.text("BALANCE", colX[4], doc.y + 5, { width: 80, align: "right" })
    doc.font("Helvetica").fillColor("#222")
    doc.y += 22
  }

  doc.fontSize(8).fillColor("#333")
    .text(`Opening Balance: INR ${openingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`)
  doc.moveDown(0.5)
  drawHeader()

  if (txns.length === 0) {
    doc.text("No transactions in this period.", 46, doc.y + 4)
    doc.y += 16
  }

  for (const t of txns) {
    if (doc.y > 770) {
      doc.addPage()
      drawHeader()
    }
    const amt = Math.abs(t.amount)
    const isCredit = t.type === "CREDIT"
    running = Math.round((running + t.amount) * 100) / 100

    if ((doc.currentLineHeight() | 0) % 2 === 0) {
      doc.rect(40, doc.y - 2, 515, 16).fill("#f2f5f7")
      doc.fillColor("#222")
    }

    doc.fillColor("#222").fontSize(8)
    doc.text(new Date(t.timestamp).toLocaleDateString("en-IN"), colX[0] + 4, doc.y)
    doc.text(
      `${t.reference || ""}${t.description ? " · " + t.description.slice(0, 34) : ""}`.slice(0, 60),
      colX[1], doc.y
    )
    doc.fillColor(isCredit ? "#0a7a4d" : "#b3372e")
    doc.text(isCredit ? "" : amt.toFixed(2), colX[2], doc.y, { width: 60, align: "right" })
    doc.text(isCredit ? amt.toFixed(2) : "", colX[3], doc.y, { width: 60, align: "right" })
    doc.fillColor("#222")
    doc.text(running.toFixed(2), colX[4], doc.y, { width: 80, align: "right" })
    doc.y += 15
  }

  doc.moveDown(1)
  doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor("#cccccc").stroke()
  doc.moveDown(0.4).fontSize(8).fillColor("#555")
    .text(`Closing Balance: INR ${account.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, { align: "right" })
  doc.moveDown(2)
  doc.fontSize(7).fillColor("#999")
    .text("This is a computer-generated statement from NovaPay (simulation environment) and does not require a signature.", 40, doc.y, { width: 515 })

  doc.end()
  const pdf = await done

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="novapay-statement-${account.accountNumber.slice(-6)}.pdf"`,
    },
  })
}