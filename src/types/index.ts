export type User = {
  id: string
  email: string
  phone: string
  name: string
  avatar?: string
  kycLevel: "UNVERIFIED" | "MINIMAL" | "FULL"
  status: "ACTIVE" | "SUSPENDED" | "CLOSED"
  createdAt: Date
}

export type Account = {
  id: string
  userId: string
  type: "SAVINGS" | "CURRENT"
  balance: number
  currency: string
  accountNumber: string
  ifsc: string
  upiHandle: string
  isActive: boolean
  createdAt: Date
}

export type Card = {
  id: string
  accountId: string
  type: "VIRTUAL" | "PHYSICAL" | "METAL"
  network: "VISA" | "MASTERCARD" | "RUPAY"
  lastFour: string
  expiryMonth: number
  expiryYear: number
  status: "ACTIVE" | "FROZEN" | "CLOSED"
  dailyLimit: number
  monthlyLimit: number
  isContactless: boolean
  isOnlineEnabled: boolean
}

export type Transaction = {
  id: string
  accountId: string
  type: "CREDIT" | "DEBIT"
  amount: number
  currency: string
  status: "PENDING" | "COMPLETED" | "FAILED" | "REVERSED"
  category: string
  description: string
  reference: string
  counterparty?: string
  timestamp: Date
}

export type Beneficiary = {
  id: string
  userId: string
  name: string
  accountNumber?: string
  ifsc?: string
  upiId?: string
  email?: string
  type: "BANK" | "UPI" | "EMAIL" | "WALLET"
  isFavourite: boolean
}

export type Budget = {
  id: string
  userId: string
  category: string
  amount: number
  spent: number
  period: "WEEKLY" | "MONTHLY" | "YEARLY"
  month: string
}

export type FamilyMember = {
  id: string
  parentId: string
  childId: string
  name: string
  avatar?: string
  dailyLimit: number
  monthlyLimit: number
  isActive: boolean
}

export type Reward = {
  id: string
  userId: string
  points: number
  tier: "SILVER" | "GOLD" | "PLATINUM"
  cashback: number
  joinedAt: Date
}
