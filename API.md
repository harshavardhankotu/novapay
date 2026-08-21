# Revolut India API Documentation

## Authentication
All API routes (except /api/auth/*) require JWT token in httpOnly cookie.

## Auth
- `POST /api/auth/signup` - Create account (email, phone, name, password)
- `POST /api/auth/login` - Login (email/phone + password)
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Get current user profile

## Banking
- `GET/POST /api/accounts` - List/create accounts
- `GET/POST /api/fixed-deposits` - Fixed deposits
- `GET/POST /api/recurring-deposits` - Recurring deposits
- `GET/POST /api/loans` - Loan products
- `GET /api/credit-score` - CIBIL score with factors
- `GET/POST /api/nre-accounts` - NRE/NRO accounts

## Cards
- `GET/POST /api/cards` - List/apply cards
- `PATCH /api/cards` - Freeze/unfreeze
- `GET/POST/PATCH /api/saved-cards` - Saved card management

## Payments
- `GET/POST /api/upi-ids` - UPI ID management
- `GET/POST/PATCH /api/billers` - Biller management
- `POST /api/bill-payments` - Pay bills
- `GET/POST/PATCH /api/mandates` - Recurring payment mandates

## Transfers
- `GET/POST /api/transfers` - List/make transfers
- `GET/POST /api/transactions` - Transaction history
- `GET/POST /api/budgets` - Budget management

## Investments
- `GET/POST /api/mutual-funds` - Mutual fund investments
- `GET/PATCH /api/gold` - Digital gold
- `GET /api/crypto` - Crypto holdings

## Insurance
- `GET/POST /api/insurance` - Insurance policies

## Security
- `GET /api/security` - Security audit logs
- `GET/DELETE /api/sessions` - Session management
- `GET/DELETE /api/trusted-devices` - Device management
- `GET/PATCH /api/two-factor-auth` - 2FA TOTP
- `GET/POST /api/external-accounts` - Account Aggregator

## International
- `GET/POST /api/lrs` - LRS remittance (RBI)
- `GET /api/receiving-accounts` - International receiving
- `GET/POST /api/esim` - eSIM data plans

## Features
- `GET/POST/PATCH /api/pockets` - Smart Pockets
- `GET/PATCH /api/roundups` - Round-up savings
- `GET/POST /api/rewards` - Rewards & points
- `GET/POST /api/referrals` - Referral program
- `GET/POST /api/expense-splits` - Expense splitting
- `GET /api/rupay-credit` - RuPay credit line
- `GET/POST /api/disputes` - NPCI chargeback
- `GET/POST /api/kids` - Kids accounts
- `GET/POST /api/family` - Family account management
- `GET /api/offers` - Offers & deals
- `GET/POST /api/support` - Support tickets

## Admin
- `GET/POST /api/admin` - Admin operations

## Notifications
- `GET/PATCH /api/notifications` - Push/SMS/email notifications

## KYC
- `GET/POST /api/kyc` - KYC document submission
