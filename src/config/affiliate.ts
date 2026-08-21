export interface AffiliateSlot {
  id: string
  partner: string
  title: string
  desc: string
  reward: string
  category: "credit-card" | "loan" | "insurance" | "investment" | "savings"
  url: string
  featured?: boolean
}

/**
 * Partner referral slots. Replace `url` values with your real affiliate /
 * DSA links (Paisabazaar DSA, BankBazaar, broker referral programs, etc.).
 * Clicks are logged via /api/affiliate/[id] before redirecting.
 */
export const AFFILIATE_SLOTS: AffiliateSlot[] = [
  {
    id: "credit-card-premium",
    partner: "CardCompare",
    title: "Premium Credit Cards",
    desc: "Compare and apply for lifetime-free premium cards. Earn ₹500–₹1,500 per approved application.",
    reward: "₹500–₹1,500 / approval",
    category: "credit-card",
    url: "https://example.com/credit-cards?ref=novapay",
    featured: true,
  },
  {
    id: "personal-loan",
    partner: "LoanBridge",
    title: "Personal Loans from 10.5%",
    desc: "Pre-approved offers from 15+ lenders. Commission of ~1–2% on disbursed amount.",
    reward: "1–2% of disbursal",
    category: "loan",
    url: "https://example.com/personal-loans?ref=novapay",
  },
  {
    id: "term-insurance",
    partner: "SafeCover",
    title: "Term Life Insurance",
    desc: "₹1 crore cover from ₹450/month. Flat payout per completed application.",
    reward: "Flat fee / policy",
    category: "insurance",
    url: "https://example.com/term-insurance?ref=novapay",
  },
  {
    id: "index-funds",
    partner: "WealthPath",
    title: "Start an SIP",
    desc: "Direct-plan index funds at zero commission. Referral bonus per funded account.",
    reward: "Per funded account",
    category: "investment",
    url: "https://example.com/sip?ref=novapay",
  },
]

export function getSlot(id: string): AffiliateSlot | undefined {
  return AFFILIATE_SLOTS.find((s) => s.id === id)
}