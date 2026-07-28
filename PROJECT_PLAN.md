# Revolut India Clone - Banking System Project Plan

## Overview
A next-gen digital banking platform for India inspired by Revolut — combining UPI, multi-currency spending, AI budgeting, and family banking in one app.

---

## 5 Unique Selling Points (Indian Pain Points)

### 1. Zero-Forex International Spending
- **Pain Point:** Indian banks charge 3–5% forex markup + ₹500–₹2,500 per SWIFT transfer. Indians lose ~$600M/year in bank charges.
- **Solution:** Interbank forex rates + 0% markup. Multi-currency wallet (USD, EUR, GBP, AED, SGD) with real-time conversion.

### 2. Unified UPI + Global Wallet
- **Pain Point:** Indians need 3–4 apps (GPay for UPI, bank app for domestic, Wise for forex, CRED for bills). No single app does it all.
- **Solution:** One app with UPI handles, domestic Visa card, multi-currency card, bill payments, and international transfers.

### 3. Instant Video KYC (5-Minute Onboarding)
- **Pain Point:** Traditional banks take 2–7 days for account opening. DigiLocker integration is fragmented.
- **Solution:** Aadhaar eKYC + Video KYC (RBI-compliant) → full account in <5 minutes. DigiLocker document fetch.

### 4. AI-Powered Smart Budgeting (Bilingual)
- **Pain Point:** 70% of Indians don't track spending. Existing tools are English-only and don't understand Indian expense patterns.
- **Solution:** Auto-categorization of UPI/bank transactions, Hindi + English voice/chat interface, AI savings suggestions, recurring payment reminders.

### 5. Family Banking with Guardian Controls
- **Pain Point:** No good solution for kids/teens banking in India. Parents give cash/cards with no visibility.
- **Solution:** Sub-accounts for kids with configurable limits, real-time alerts to parents, task-based allowances, spend categorization.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5 (strict) |
| **UI Library** | shadcn/ui (Radix UI primitives) |
| **Styling** | Tailwind CSS v4 |
| **State** | Zustand |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | Auth.js v5 (NextAuth) |
| **Payments** | Razorpay / Cashfree (UPI + Cards) |
| **KYC** | Digilocker API + Video KYC SDK |
| **International** | Wise API / CurrencyLayer |
| **Testing** | Vitest + Playwright |
| **Container** | Docker |

---

## Project Structure

```
revolut-india-clone/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages group
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── kyc/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/        # Main app pages
│   │   │   ├── dashboard/
│   │   │   ├── accounts/
│   │   │   ├── cards/
│   │   │   ├── transfers/
│   │   │   ├── upi/
│   │   │   ├── forex/
│   │   │   ├── budgeting/
│   │   │   ├── family/
│   │   │   ├── rewards/
│   │   │   ├── settings/
│   │   │   └── support/
│   │   ├── admin/              # Admin panel
│   │   ├── api/                # API routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/             # Shared components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Sidebar, navbar, footer
│   │   ├── accounts/           # Account cards, lists
│   │   ├── cards/              # Virtual/physical cards
│   │   ├── transactions/       # Transaction lists, filters
│   │   ├── charts/             # Spending charts
│   │   ├── forms/              # Form components
│   │   └── modals/             # Shared modals
│   ├── lib/                    # Utilities
│   │   ├── prisma.ts           # DB client
│   │   ├── auth.ts             # Auth config
│   │   ├── utils.ts            # Helpers
│   │   ├── validations/        # Zod schemas
│   │   └── constants.ts        # App constants
│   ├── hooks/                  # Custom React hooks
│   ├── store/                  # Zustand stores
│   └── types/                  # TypeScript types
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data
├── public/                     # Static assets
│   ├── images/
│   └── icons/
├── tests/                      # Test files
├── docs/                       # Documentation
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── .env.example
└── README.md
```

---

## Database Schema (Prisma)

### Core Entities
- **User** — id, email, phone, aadhaar, pan, status, kycLevel, createdAt
- **Account** — id, userId, type (SAVINGS/CURRENT), balance, currency, accountNumber, ifsc, upiHandle
- **Card** — id, accountId, type (VIRTUAL/PHYSICAL/METAL), network (VISA/MC), status, limits, expiry
- **Transaction** — id, accountId, type, amount, currency, status, category, description, reference, timestamp
- **Beneficiary** — id, userId, name, accountNumber, ifsc, upiId, type
- **Budget** — id, userId, category, amount, spent, period, month
- **Family** — id, parentUserId, childUserId, limits, permissions
- **Rewards** — id, userId, points, tier, history

### Compliance
- **KycDocument** — id, userId, type (AADHAAR/PAN/VIDEO), status, url, verifiedAt
- **AuditLog** — id, userId, action, ip, device, timestamp
- **ComplianceReport** — id, type, data, generatedAt

---

## UI Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Marketing page with signup CTA |
| `/login` | Login | Phone/email + OTP/MFA |
| `/signup` | Register | Step-by-step with DigiLocker |
| `/kyc` | KYC | Video KYC + document upload |
| `/dashboard` | Dashboard | Balance, recent transactions, quick actions |
| `/accounts` | Accounts | All accounts with balances |
| `/accounts/[id]` | Account Detail | Statement, filters, export |
| `/cards` | Cards | Virtual/physical cards |
| `/cards/apply` | Apply Card | Card type selection |
| `/transfers` | Transfers | Send money (NEFT/IMPS/UPI) |
| `/transfers/international` | International | Multi-currency transfer |
| `/upi` | UPI | UPI handles, QR, payments |
| `/forex` | Forex | Exchange rates, convert, hold |
| `/budgeting` | Budgeting | AI insights, budget setup |
| `/budgeting/insights` | Insights | Spending patterns |
| `/family` | Family | Manage family accounts |
| `/rewards` | Rewards | RevPoints, cashback, offers |
| `/settings` | Settings | Profile, security, preferences |
| `/support` | Support | Chat, FAQ, tickets |
| `/admin` | Admin | Compliance, users, audit |

---

## Compliance (RBI Guidelines)

1. **PPI License** — Prepaid Payment Instrument wallet (no cash deposits)
2. **KYC** — Full KYC mandatory (Aadhaar + PAN + Video KYC)
3. **FATCA/CRS** — Foreign account reporting
4. **FEMA** — LRS tracking for international transfers (₹250K/yr limit)
5. **PCI-DSS** — Card data security
6. **Data Localization** — All data stored in India (RBI circular 2018)
7. **Audit Trail** — All transactions logged for 10 years

---

## Feature Priority Matrix

| Feature | Priority | Complexity | Timeline |
|---------|----------|------------|----------|
| Auth + KYC | P0 | Medium | Week 1 |
| Dashboard | P0 | Medium | Week 1 |
| Accounts | P0 | Medium | Week 2 |
| UPI Payments | P0 | High | Week 2-3 |
| Transfers (Domestic) | P0 | Medium | Week 2 |
| Card Management | P1 | High | Week 3 |
| Forex | P1 | High | Week 3-4 |
| Budgeting (AI) | P1 | High | Week 4 |
| Family Banking | P2 | Medium | Week 4-5 |
| Rewards | P2 | Medium | Week 5 |
| Admin Panel | P2 | Low | Ongoing |
| International Transfers | P3 | High | Week 5-6 |
