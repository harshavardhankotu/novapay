/**
 * ── Missed-call / IVR banking SIMULATION (P13) ───────────────────────────────
 * A text-based state machine modelling the low-tech "missed call banking"
 * pattern used by Indian banks for financial inclusion (e.g., *99# USSD).
 * NO telephony — sessions are driven through a web endpoint and clearly
 * labelled as a simulation everywhere they render.
 */

export type IvrState = "GREETING" | "AUTH" | "MENU" | "DONE"

export interface IvrSession {
  userId: string
  state: IvrState
  authed: boolean
  lastReply: string
}

const MENU_TEXT = `MENU:
1 - Balance enquiry
2 - Mini statement (last 3)
3 - Block all cards
0 - Repeat menu`

export function ivrGreeting(name: string): string {
  return `Welcome to NovaPay missed-call banking (SIMULATION), ${name}.\n${MENU_TEXT}`
}

/** Processes one digit of input inside a session. Returns reply + next state. */
export async function handleIvrInput(
  session: IvrSession,
  input: string,
  helpers: {
    getBalance: () => Promise<number>
    getMiniStatement: () => Promise<string[]>
    blockAllCards: () => Promise<number>
    onBlock?: () => void
  }
): Promise<{ reply: string; state: IvrState }> {
  const digit = input.trim()[0]

  if (digit === "0") return { reply: MENU_TEXT, state: "MENU" }

  if (digit === "1") {
    const bal = await helpers.getBalance()
    return { reply: `Your total balance is ₹${bal.toLocaleString("en-IN")}.`, state: "MENU" }
  }

  if (digit === "2") {
    const rows = await helpers.getMiniStatement()
    if (!rows.length) return { reply: "No recent transactions.", state: "MENU" }
    return { reply: `Last ${rows.length} transactions:\n${rows.map((r) => `• ${r}`).join("\n")}`, state: "MENU" }
  }

  if (digit === "3") {
    const n = await helpers.blockAllCards()
    return {
      reply: n > 0 ? `${n} card(s) frozen immediately. Stay safe!` : "No active cards found to block.",
      state: "MENU",
    }
  }

  return { reply: `Invalid option "${input}".\n${MENU_TEXT}`, state: "MENU" }
}