# NovaPay — India-first Open-Source Banking Starter Kit

[![CI](https://github.com/harshavardhankotu/novapay/actions/workflows/ci.yml/badge.svg)](https://github.com/harshavardhankotu/novapay/actions/workflows/ci.yml)
![Tests](https://img.shields.io/badge/tests-24%20passing-4ade80)
![License](https://img.shields.io/badge/license-MIT-e8a33d)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

NovaPay is an **India-first open-source banking starter kit**: a complete full-stack reference implementation of a digital bank — OTP auth, eKYC verification, a signed double-sided ledger, deposits with interest & TDS, lending with amortization schedules, cards, fraud radar, credit scoring, and more.

**Simulation by design.** Money movement is a faithful, clearly-labeled simulation of real rails (UPI/NEFT/RTGS/IMPS), so the entire platform runs licence-free at ₹0/month on free tiers. Every simulated boundary is marked in the UI and documented — nothing pretends to be a real integration.

## Screenshots

> 📸 *Add your screenshots here — landing hero, dashboard, cards, admin analytics. Recommended: 1280×800 PNG under 2 MB.*

| Dashboard | Cards | Admin Analytics |
|---|---|---|
| *(screenshot)* | *(screenshot)* | *(screenshot)* |

## Feature Matrix

| Domain | What's implemented |
|---|---|
| Auth | Email/phone login · OTP challenge with lockout · bcrypt · HttpOnly JWT cookies · rate limiting |
| KYC / Identity | Aadhaar Verhoeff checksum · PAN regex · duplicate detection · masked storage · DigiLocker-style OTP flow · video-KYC step (**simulated** — real agent verification planned) |
| Ledger | Signed amounts · atomic balance checks inside transactions · idempotency keys · paise rounding |
| Payments | UPI-style instant transfers · NEFT/RTGS/IMPS rail differentiation with real operational rules · bill payments · mandates/NACH · standing instructions |
| Deposits | Savings interest accrual · FD compounding by slab · RD · TDS simulation (₹40k/₹50k senior threshold) · Form 16A-style summary · joint accounts + nominee |
| Lending | Origination flow → eligibility (Financial Health Score) → decision with stated reasoning → disbursal · reducing-balance amortization schedules (stored) · overdraft facility (interest on utilized only) · delinquency ladder |
| Scoring | Financial Health Score (0–100) with named weights + plain-language factor explanations · weekly snapshots · alternative thin-file model for lending · early-warning nudges |
| Cards | Virtual/physical/metal · freeze/unfreeze · per-tx limits · MCC blocking · international toggle · POS/ATM swipe simulator with real decline reasons |
| Fraud Radar | Explainable rule flags (velocity, z-score, new-recipient, new-device) wired into STR case lifecycle |
| Compliance | AML watchlist screening (simulated list) · STR case management · RBI-return report stub · dispute state machine with provisional credit · ticket SLAs · account-closure settlement |
| Insights | Predictive cash-flow calendar with shortfall causes · receipt OCR capture (LLM w/ user confirmation) · natural-language ledger query over whitelisted shapes |
| Platform | PWA manifest · i18n (EN/HI/TE deep coverage) · lite mode · audit logs · sessions · 2FA UI · admin analytics · developer API (`/api/v1`, scoped keys, webhooks) · IVR banking simulation · Digital Rupee (e₹) token wallet · Account Aggregator consent layer |
| Theming | 3 switchable themes (Deepwater default, Aurora, Sunset Dunes) via `data-theme` |

## Quick Start

```bash
git clone https://github.com/harshavardhankotu/novapay.git && cd novapay
npm install
npx prisma generate && npx prisma db push
npm run seed        # demo account + admin + backdated data
npm run dev         # http://localhost:3000
```

| | |
|---|---|
| Live demo | Landing page → *Try Live Demo* (self-seeds, no signup) |
| Test login | `test@novapay.in` / `Test@1234` |
| Admin analytics | `admin@novapay.in` / `Admin@1234` → `/admin` |
| Docs | `/docs` in-app · API: `API.md` |
| Pricing | Free OSS / Pro Kit / Institution — see `/pricing` |

## Deploy for ₹0/month

Free tiers end-to-end: Vercel Hobby + Turso (libSQL) + GitHub. Steps in `/docs`.

## License

MIT — see [LICENSE](./LICENSE).