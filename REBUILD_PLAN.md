# Rebuild Plan: Banking App Overhaul

## Issues with Current Build
1. UI feels "AI-generated" — too generic, lacks real banking polish
2. No responsive mobile layout (no bottom nav, no touch-optimized controls)
3. No actual backend API integration (all mock data)
4. Missing 15+ features competitors have
5. RBI compliance gaps
6. No dark/light mode toggle
7. No real authentication flow
8. No transaction search/filter/pagination
9. No bill payments, recharges, or investment features

## Open Source References to Study
- **shadcn-fintech** (github.com/abderrahimghazali/shadcn-fintech) — premium fintech dashboard
- **nextjs-banking-app** by rOluochKe — fintech with Plaid/Dwolla
- **NeoBank Dashboard** by Gemu03 — mobile-first banking
- **Apache Fineract** — core banking backend (reference only)

## Competitor Features to Incorporate
| Feature | PhonePe | GPay | CRED | Niyo | Fi | Jupiter |
|---------|---------|------|------|------|----|---------|
| UPI Payments | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Credit Card Bill | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Recharges | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Investment (MF/SIP) | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Credit Score | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Insurance | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Expense Tracking | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Savings Goals | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Salary Features | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Forex/Multi-Currency | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Bill Reminders | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Scan & Pay | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gold Purchase | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Loan Products | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |

## Gray Areas & Opportunities (Launch Differentiators)
1. **Unified Dashboard** — No Indian app combines UPI + forex + investments + budgeting in one view
2. **Bilingual AI** — Budgeting insights in Hindi/English (no competitor does this well)
3. **Family Banking** — Jupiter/Fi don't have it; CRED/PhonePe only basic
4. **Zero-Forex** — Only Niyo/Xflow do this; Revolut's core strength
5. **Gamified Rewards** — Similar to CRED but for ALL transactions, not just credit cards
6. **Small Business Features** — UPI QR for small merchants, invoice generation
7. **Salary Advance** — Short-term credit against salary (like Jupiter)

## Missing Features (Full List)
1. ✅ UPI Payments & QR
2. ✅ Multi-Currency Accounts
3. ✅ Virtual/Physical Cards
4. ✅ Budgeting & Insights
5. ✅ Family Banking
6. ❌ **Bill Payments** (electricity, water, gas, broadband, DTH)
7. ❌ **Mobile Recharges** (prepaid/postpaid plans)
8. ❌ **Credit Card Bill Payment**
9. ❌ **Investment Hub** (MF, SIP, stocks, FD, gold)
10. ❌ **Credit Score Tracker** (CIBIL/Experian)
11. ❌ **Insurance** (travel, health, cyber fraud)
12. ❌ **Loan Products** (personal, salary advance)
13. ❌ **Savings Goals** with automated rules
14. ❌ **Salary Account** features (auto-save, round-ups)
15. ❌ **Bill Split** (group expenses with friends)
16. ❌ **Tax Saving** (80C investments, tax harvest)
17. ❌ **Recurring Payments** (mandates management)
18. ❌ **Expense Export** (PDF/CSV for CA)
19. ❌ **Cashback & Offers** marketplace
20. ❌ **Scan & Pay** (QR scanner)
21. ❌ **Offline UPI** (UPI Lite / 123Pay)
22. ❌ **ATM Locator** near me
23. ❌ **Cheque Book Request**
24. ❌ **Standing Instructions** management

## RBI Compliance Checklist
- [ ] PPI License (minimum net worth ₹5Cr)
- [ ] Full KYC (Aadhaar + PAN + Video KYC)
- [ ] Data Localization (all data in India)
- [ ] PCI-DSS for card data
- [ ] VAPT audit (annual)
- [ ] CERT-In incident reporting (6hr window)
- [ ] CISO appointment
- [ ] Escrow account for wallet funds
- [ ] Grievance redressal mechanism (30-day resolution)
- [ ] PMLA compliance (5yr record retention)
- [ ] FATCA/CRS reporting
- [ ] FEMA compliance for forex
- [ ] DPDP Act (data privacy)
- [ ] Audit trail (10yr retention)
- [ ] Board oversight committee

## Phase 2: API Backend Plan
- `/api/auth/*` — Register, login, OTP, session
- `/api/accounts/*` — CRUD accounts, balance
- `/api/transactions/*` — List, filter, search, export
- `/api/upi/*` — UPI handles, payments, QR
- `/api/cards/*` — Card CRUD, freeze, limits
- `/api/transfers/*` — NEFT/IMPS/UPI/international
- `/api/forex/*` — Rates, convert, wallets
- `/api/budget/*` — Budgets, insights, categories
- `/api/family/*` — Family management
- `/api/rewards/*` — Points, tiers, redemption
- `/api/bills/*` — Bill payments, recharges, reminders
- `/api/investments/*` — MF, SIP, FD
- `/api/credit-score/*` — Score fetch, report
- `/api/kyc/*` — Document upload, verification
- `/api/admin/*` — Compliance, audit, users

## UI Redesign Plan
1. **Mobile Bottom Nav** — 5 tabs: Home, Payments, Cards, Insights, Profile
2. **Desktop Sidebar** — Full navigation with icons
3. **Glassmorphism Cards** — Real banking card designs
4. **Micro-interactions** — Smooth transitions, hover states
5. **Loading Skeletons** — Every page has skeleton loading
6. **Empty States** — Friendly illustrations for empty data
7. **Toast Notifications** — For transactions, errors
8. **Search Bar** — Global search with keyboard shortcut
9. **Dark Mode Toggle** — System-aware with manual override
10. **Responsive Tables** — Scrollable on mobile
