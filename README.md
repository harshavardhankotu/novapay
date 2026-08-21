# NovaPay — The Open-Source Digital Banking Platform

[![CI](https://github.com/harshavardhankotu/novapay/actions/workflows/ci.yml/badge.svg)](https://github.com/harshavardhankotu/novapay/actions/workflows/ci.yml)
![Tests](https://img.shields.io/badge/tests-15%20passing-4ade80)
![License](https://img.shields.io/badge/license-MIT-e8a33d)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

A production-grade **fintech starter kit & banking simulator** built with a calm, organic aesthetic — **deep water at golden hour**. Full auth with OTP, eKYC verification, a working ledger, 47 screens and 40+ API routes. Clone it, learn from it, ship your own neobank on it.

## Screenshots

> 📸 *Add your screenshots here — landing page hero, dashboard, cards page, admin analytics. Recommended: 1280×800 PNG or GIF under 2 MB each.*

| Dashboard | Cards | Admin Analytics |
|---|---|---|
| *(screenshot)* | *(screenshot)* | *(screenshot)* |

- **Instant demo:** click *Try Live Demo* on the landing page (self-seeds, no signup)
- **Zero-cost stack:** runs entirely on free tiers (Vercel Hobby + Turso/local SQLite)
- **Licence-free by design:** money movement is simulated — no RBI/NPCI dependencies to deploy

| | |
|---|---|
| Docs | `/docs` in the app |
| Pricing (OSS / Pro Kit / Institution) | `/pricing` |
| Test login | `test@novapay.in` / `Test@1234` |
| Admin analytics | `admin@novapay.in` / `Admin@1234` → `/admin` |

A unified Indian digital-banking experience inspired by calm, natural aesthetics — **deep water at golden hour**. UPI, multi-currency accounts, zero-forex cards, AI budgeting, and family banking in one app.

![Theme](https://img.shields.io/badge/theme-Deepwater%20%26%20Golden%20Hour-e8a33d)

## Features

- **UPI + Domestic + Global** — one app for UPI, domestic transfers and international spending
- **Zero-Forex Spending** — interbank rates with 0% markup on international transactions
- **5-Minute KYC** — Aadhaar eKYC + video verification
- **AI Budgeting** — auto-categorization and spending forecasts
- **Family Banking** — kids accounts with parent controls, limits and allowances
- **NovaPoints Rewards** — earn points on every spend
- **Deepwater & Golden Hour theme** — a calm, organic aesthetic inspired by kelp forests, bone-white limestone, golden-hour train windows, and drifting mountain fog

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** SQLite via Prisma + libSQL adapter
- **Auth:** JWT (HttpOnly cookie) + bcrypt
- **Styling:** Tailwind CSS v4 + Radix UI
- **State:** Zustand
- **Testing:** Vitest

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up the database (creates dev.db)
npx prisma db push

# 3. Seed test data
npm run seed

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test credentials

```
Email:    test@novapay.in
Password: Test@1234
```

## Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `npm run dev`    | Start dev server         |
| `npm run build`  | Production build         |
| `npm run start`  | Start production server  |
| `npm run lint`   | Lint with ESLint         |
| `npm run seed`   | Seed the database        |
| `npx vitest run` | Run tests                |

## Environment Variables

See `.env.example` for all required variables. Copy to `.env` and fill in.

## License

Private project — all rights reserved.