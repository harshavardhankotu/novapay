import { prisma } from "@/lib/prisma"
import { signWebhook } from "@/lib/api-auth"

export type WebhookEvent = "transaction.completed" | "mandate.failed"

/**
 * Fire-and-forget signed webhook delivery to every active registration
 * subscribed to the event. Never throws into caller flows.
 */
export async function deliverWebhook(event: WebhookEvent, payload: Record<string, unknown>): Promise<void> {
  try {
    const regs = await prisma.webhookRegistration.findMany({ where: { active: true } })
    const matching = regs.filter((r) => r.events.split(",").map((e) => e.trim()).includes(event))
    await Promise.all(
      matching.map(async (r) => {
        const body = JSON.stringify({ event, payload, deliveredAt: new Date().toISOString() })
        const timestamp = Date.now()
        const signature = signWebhook(r.secret, body, timestamp)
        await fetch(r.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-NovaPay-Event": event,
            "X-NovaPay-Signature": `t=${timestamp},v1=${signature}`,
          },
          body,
          signal: AbortSignal.timeout(8000),
        }).catch(() => {}) // delivery failures are swallowed by design (retry job out of scope)
      })
    )
  } catch {
    // never break the triggering flow
  }
}