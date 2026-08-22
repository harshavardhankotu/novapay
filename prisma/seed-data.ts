import { hashPassword } from "../src/lib/auth/password"
import { APP_NAME } from "../src/lib/constants"

// Seed helpers run outside the Next.js app against a real Prisma client;
// a loose type is intentional here to keep the seed self-contained.
type PrismaLike = {
  user: {
    findUnique(args: { where: { email?: string } }): Promise<Record<string, unknown> | null>
    findFirst(args: Record<string, unknown>): Promise<{ id: string; accounts: Array<{ id: string; accountNumber: string; upiHandle?: string | null }> } | null>
    update(args: Record<string, unknown>): Promise<unknown>
    create(args: Record<string, unknown>): Promise<{ id: string; accounts: Array<{ id: string }> }>
  }
  account: { update(args: Record<string, unknown>): Promise<unknown>; findUnique(args: { where: { upiHandle: string } }): Promise<unknown> }
  transaction: { create(args: Record<string, unknown>): Promise<unknown> }
  card: { createMany(args: Record<string, unknown>): Promise<unknown> }
  beneficiary: { createMany(args: Record<string, unknown>): Promise<unknown> }
  budget: { createMany(args: Record<string, unknown>): Promise<unknown> }
  fixedDeposit: { create(args: Record<string, unknown>): Promise<unknown> }
  loan: { create(args: Record<string, unknown>): Promise<unknown> }
  mutualFundInvestment: { create(args: Record<string, unknown>): Promise<unknown> }
  insurancePolicy: { create(args: Record<string, unknown>): Promise<unknown> }
  biller: { create(args: Record<string, unknown>): Promise<{ id: string }> }
  billPayment: { create(args: Record<string, unknown>): Promise<unknown> }
  paymentMandate: { create(args: Record<string, unknown>): Promise<unknown> }
  smartPocket: { create(args: Record<string, unknown>): Promise<unknown> }
  esimPackage: { create(args: Record<string, unknown>): Promise<unknown> }
  cryptoHolding: { createMany(args: Record<string, unknown>): Promise<unknown> }
  lRSTransaction: { create(args: Record<string, unknown>): Promise<unknown> }
  offer: { createMany(args: Record<string, unknown>): Promise<unknown> }
  notification: { createMany(args: Record<string, unknown>): Promise<unknown> }
  auditLog: { createMany(args: Record<string, unknown>): Promise<unknown> }
}

export const DEMO_EMAIL = "test@novapay.in"
export const DEMO_PASSWORD = "Test@1234"
export const ADMIN_EMAIL = "admin@novapay.in"
export const ADMIN_PASSWORD = "Admin@1234"

/**
 * Ensures the operator/admin account exists. Cheap + idempotent.
 */
export async function ensureAdminUser(prisma: PrismaLike): Promise<boolean> {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
  if (existing) return false
  try {
    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        phone: "9700000001",
        name: "NovaPay Admin",
        password: await hashPassword(ADMIN_PASSWORD),
        kycLevel: "FULL",
        pan: "ZZZZA9999Z",
        role: "ADMIN",
      },
    })
    return true
  } catch {
    return false
  }
}

/** Seeds the default interest-rate slab table (admin-editable afterwards). */
export async function ensureRateSlabs(prisma: PrismaLike): Promise<void> {
  const existing = (prisma as any).rateSlab
  if (!existing) return
  const count = await existing.count()
  if (count > 0) return
  const now = new Date()
  const rows = [
    { product: "SAVINGS", minAmount: 0, maxAmount: null, tenureMonths: null, rate: 3.5 },
    { product: "FD", minAmount: 0, maxAmount: 99999, tenureMonths: 12, rate: 7.0 },
    { product: "FD", minAmount: 100000, maxAmount: null, tenureMonths: 12, rate: 7.25 },
    { product: "FD", minAmount: 0, maxAmount: null, tenureMonths: 24, rate: 7.5 },
    { product: "RD", minAmount: 0, maxAmount: null, tenureMonths: null, rate: 6.5 },
  ]
  for (const r of rows) {
    await existing.create({ data: { ...r, effectiveFrom: now } })
  }
}

/**
 * Idempotent demo seed. Migrates legacy-branded users, otherwise creates
 * a fully populated demo account. Safe to call on every cold boot.
 */
export async function seedDemoUser(prisma: PrismaLike): Promise<{ created: boolean; migrated: boolean }> {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } })
  if (existing) return { created: false, migrated: false }

  // Migrate legacy seed user (pre-rebrand credentials/PAN) if present
  const legacy = await prisma.user.findFirst({
    where: { OR: [{ pan: "ABCDE1234F" }, { phone: "9999999999" }, { email: "test@revolut.in" }] },
    include: { accounts: true },
  })
  if (legacy) {
    const hashedLegacyPassword = await hashPassword(DEMO_PASSWORD)
    await prisma.user.update({
      where: { id: legacy.id },
      data: { email: DEMO_EMAIL, password: hashedLegacyPassword },
    })
    for (let i = 0; i < legacy.accounts.length; i++) {
      const acc = legacy.accounts[i]
      await prisma.account.update({
        where: { id: acc.id },
        data: {
          accountNumber: acc.accountNumber.startsWith("NOVA") ? acc.accountNumber : `NOVAINR${String(i).padEnd(8, "0")}12345678`.slice(0, 16),
          ifsc: "NOVA0000001",
          upiHandle: i === 0 ? "testuser@novapay" : acc.upiHandle,
        },
      })
    }
    return { created: false, migrated: true }
  }

  const hashedPassword = await hashPassword(DEMO_PASSWORD)

  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      phone: "9999999999",
      name: "Test User",
      password: hashedPassword,
      kycLevel: "FULL",
      aadhaar: "123412341234",
      pan: "ABCDE1234F",
      accounts: {
        create: [
          {
            type: "SAVINGS",
            balance: 125000,
            currency: "INR",
            accountNumber: "NOVAINR12345678",
            ifsc: "NOVA0000001",
            upiHandle: "testuser@novapay",
          },
          {
            type: "CURRENT",
            balance: 50000,
            currency: "INR",
            accountNumber: "NOVAINR87654321",
            ifsc: "NOVA0000001",
          },
        ],
      },
      rewards: {
        create: { points: 2500, tier: "GOLD", cashback: 450 },
      },
      roundupConfig: {
        create: { enabled: true, multiplier: 1, savedTotal: 1280 },
      },
      digitalGold: {
        create: { grams: 2.5 },
      },
      rupayCreditLine: {
        create: {
          totalLimit: 150000,
          usedLimit: 35000,
          dueDate: new Date(Date.now() + 45 * 86400000),
          interestFreeDays: 45,
          upiEnabled: true,
        },
      },
    },
    include: { accounts: true, rewards: true },
  })

  // Sample transactions
  const categories = ["Food", "Shopping", "Transport", "Bills", "Entertainment", "Health", "Education", "Travel"]
  const descriptions = ["Swiggy Order", "Amazon Pay", "Uber Ride", "Electricity Bill", "Netflix", "Pharmacy", "Course Fee", "Flight Ticket"]
  const amounts = [450, 2499, 350, 2850, 649, 1200, 5999, 12500]

  for (let i = 0; i < 25; i++) {
    const idx = i % categories.length
    const amt = amounts[idx] + Math.floor(Math.random() * 500)
    await prisma.transaction.create({
      data: {
        accountId: user.accounts[0].id,
        type: i % 5 === 0 ? "CREDIT" : "DEBIT",
        amount: i % 5 === 0 ? amt : -amt,
        currency: "INR",
        status: "COMPLETED",
        category: categories[idx],
        description: descriptions[idx],
        reference: `TXN${Date.now()}${i}`,
        counterparty: i % 5 === 0 ? "Salary" : descriptions[idx],
        timestamp: new Date(Date.now() - i * 86400000),
      },
    })
  }

  // Cards
  await prisma.card.createMany({
    data: [
      { accountId: user.accounts[0].id, type: "VIRTUAL", network: "VISA", lastFour: "4829", expiryMonth: 12, expiryYear: 28, cvv: "***", dailyLimit: 100000, monthlyLimit: 500000 },
      { accountId: user.accounts[0].id, type: "PHYSICAL", network: "RUPAY", lastFour: "7512", expiryMonth: 8, expiryYear: 27, cvv: "***", dailyLimit: 50000, monthlyLimit: 200000 },
    ],
  })

  // Beneficiaries
  await prisma.beneficiary.createMany({
    data: [
      { userId: user.id, name: "Rahul Sharma", accountNumber: "IN7001234567890", ifsc: "HDFC0001234", type: "BANK", isFavourite: true },
      { userId: user.id, name: "Priya Patel", upiId: "priya@paytm", type: "UPI", isFavourite: true },
      { userId: user.id, name: "Amit Singh", accountNumber: "IN7009876543210", ifsc: "ICIC0005678", type: "BANK" },
    ],
  })

  // Budgets
  await prisma.budget.createMany({
    data: [
      { userId: user.id, category: "Food", amount: 15000, spent: 8200, period: "MONTHLY", month: new Date().toISOString().slice(0, 7) },
      { userId: user.id, category: "Shopping", amount: 20000, spent: 14500, period: "MONTHLY", month: new Date().toISOString().slice(0, 7) },
      { userId: user.id, category: "Transport", amount: 8000, spent: 3200, period: "MONTHLY", month: new Date().toISOString().slice(0, 7) },
    ],
  })

  // FD
  await prisma.fixedDeposit.create({
    data: {
      userId: user.id, accountId: user.accounts[0].id, amount: 50000, interestRate: 7.5,
      tenureMonths: 12, maturityDate: new Date(Date.now() + 365 * 86400000), maturityAmount: 53875,
      nominee: "Spouse", status: "ACTIVE",
    },
  })

  // Loan
  await prisma.loan.create({
    data: {
      userId: user.id, accountId: user.accounts[0].id, type: "PERSONAL", principal: 300000,
      interestRate: 10.99, tenureMonths: 24, emiAmount: 13980, outstanding: 275000,
      totalPaid: 25000, status: "ACTIVE", dueDate: new Date(Date.now() + 15 * 86400000),
    },
  })

  // Mutual fund
  await prisma.mutualFundInvestment.create({
    data: {
      userId: user.id, fundName: "SBI Bluechip Fund", fundCategory: "Large Cap",
      sipAmount: 5000, units: 45.23, nav: 118.50, investedAmount: 50000, currentValue: 53600,
      sipFrequency: "MONTHLY", sipDay: 5, status: "ACTIVE",
    },
  })

  // Insurance
  await prisma.insurancePolicy.create({
    data: {
      userId: user.id, type: "HEALTH", provider: "HDFC Ergo", policyNumber: "POL2024HEALTH001",
      sumAssured: 500000, premium: 12500, startDate: new Date(), endDate: new Date(Date.now() + 365 * 86400000),
      nominee: "Spouse", status: "ACTIVE",
    },
  })

  // Biller + payment
  const biller = await prisma.biller.create({
    data: {
      userId: user.id, category: "ELECTRICITY", name: "Tata Power", consumerNo: "TP123456789",
      nickname: "Home Electricity", autoPay: true, autoPayLimit: 5000,
    },
  })
  await prisma.billPayment.create({
    data: { billerId: biller.id, userId: user.id, amount: 2850, reference: "BILL00123456" },
  })

  // Mandate
  await prisma.paymentMandate.create({
    data: {
      userId: user.id, name: "Netflix Subscription", amount: 649, frequency: "MONTHLY",
      accountId: user.accounts[0].id, nextRun: new Date(Date.now() + 7 * 86400000),
      status: "ACTIVE", debitCount: 3, umrn: "UMRN1234567890",
    },
  })

  // Pocket
  await prisma.smartPocket.create({
    data: { userId: user.id, name: "Vacation Fund", target: 100000, current: 45000, category: "travel", color: "#2dd4bf" },
  })

  // eSIM
  await prisma.esimPackage.create({
    data: { userId: user.id, region: "Asia Pacific", data: "3 GB", validity: "7 days", price: "499", isPurchased: true },
  })

  // Crypto
  await prisma.cryptoHolding.createMany({
    data: [
      { userId: user.id, code: "BTC", name: "Bitcoin", holdings: 0.0023, priceInr: 9450000, change24h: 2.4 },
      { userId: user.id, code: "ETH", name: "Ethereum", holdings: 0.15, priceInr: 345000, change24h: -1.2 },
      { userId: user.id, code: "SOL", name: "Solana", holdings: 1.5, priceInr: 18500, change24h: 5.7 },
    ],
  })

  // LRS
  await prisma.lRSTransaction.create({
    data: {
      userId: user.id, amountUsd: 5000, amountInr: 435000, tcsAmount: 21750, purpose: "Education",
      beneficiaryName: "MIT University", status: "COMPLETED", formA2Signed: true,
    },
  })

  // Offers
  await prisma.offer.createMany({
    data: [
      { title: "Flat 20% on Swiggy", description: "Use code NOVASWIGGY", category: "food", discount: "20%", validTill: new Date(Date.now() + 30 * 86400000), code: "NOVASWIGGY", status: "ACTIVE" },
      { title: "₹500 off on Flights", description: "Domestic flights via NovaPay Travel", category: "travel", discount: "₹500", validTill: new Date(Date.now() + 45 * 86400000), code: "NOVAFLY", status: "ACTIVE" },
      { title: "10% Cashback on Amazon", description: "On first RuPay credit card use", category: "shopping", discount: "10%", validTill: new Date(Date.now() + 60 * 86400000), status: "ACTIVE" },
    ],
  })

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: user.id, title: "Salary Credited", body: "₹1,25,000 credited to your account", type: "transaction", channel: "PUSH", read: true, createdAt: new Date(Date.now() - 1 * 86400000) },
      { userId: user.id, title: "Card Swipe Alert", body: "₹2,499 spent on Amazon Pay", type: "card", channel: "PUSH", read: false, createdAt: new Date(Date.now() - 2 * 86400000) },
      { userId: user.id, title: "KYC Approved", body: "Your Aadhaar KYC has been verified", type: "info", channel: "EMAIL", read: true, createdAt: new Date(Date.now() - 5 * 86400000) },
      { userId: user.id, title: "FD Maturing Soon", body: "Your ₹50,000 FD matures in 7 days", type: "info", channel: "PUSH", read: false, createdAt: new Date(Date.now() - 6 * 86400000) },
    ],
  })

  // Audit logs
  await prisma.auditLog.createMany({
    data: [
      { userId: user.id, action: "LOGIN_SUCCESS", ip: "103.22.180.45", device: "Chrome 120 / Windows 11", details: "Login from Mumbai, IN", timestamp: new Date(Date.now() - 1 * 3600000) },
      { userId: user.id, action: "TRANSFER_INITIATED", ip: "103.22.180.45", device: "Chrome 120 / Windows 11", details: "NEFT transfer of ₹5,000 to Rahul Sharma", timestamp: new Date(Date.now() - 3 * 3600000) },
      { userId: user.id, action: "CARD_FREEZE", ip: "103.22.180.45", device: `${APP_NAME} App / iOS 18`, details: "Physical card frozen via app", timestamp: new Date(Date.now() - 24 * 3600000) },
      { userId: user.id, action: "KYC_UPDATE", ip: "103.22.180.45", device: `${APP_NAME} App / iOS 18`, details: "PAN verified successfully", timestamp: new Date(Date.now() - 7 * 86400000) },
    ],
  })

  return { created: true, migrated: false }
}