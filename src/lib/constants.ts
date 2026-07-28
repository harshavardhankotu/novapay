export const APP_NAME = "Revolut India"
export const APP_TAGLINE = "Banking Without Borders"

export const CURRENCIES = [
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "AED", name: "Dirham", symbol: "د.إ", flag: "🇦🇪" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
] as const

export const TRANSACTION_CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Bills & Utilities",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Education",
  "Travel",
  "Salary",
  "Investment",
  "Transfer",
  "Other",
] as const

export const CARD_TYPES = ["VIRTUAL", "PHYSICAL", "METAL"] as const
export const CARD_NETWORKS = ["VISA", "MASTERCARD", "RUPAY"] as const
export const ACCOUNT_TYPES = ["SAVINGS", "CURRENT"] as const
export const TRANSACTION_TYPES = ["CREDIT", "DEBIT"] as const
export const TRANSACTION_STATUSES = ["PENDING", "COMPLETED", "FAILED", "REVERSED"] as const
export const KYC_LEVELS = ["UNVERIFIED", "MINIMAL", "FULL"] as const

export const FOREX_MARKUP = 0
export const DOMESTIC_TRANSFER_LIMIT = 100000
export const INTERNATIONAL_TRANSFER_LIMIT = 250000
export const UPI_DAILY_LIMIT = 100000

export const SIDEBAR_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Accounts", href: "/accounts", icon: "Wallet" },
  { label: "Cards", href: "/cards", icon: "CreditCard" },
  { label: "Payments", href: "/upi", icon: "Smartphone" },
  { label: "Transfers", href: "/transfers", icon: "ArrowUpDown" },
  { label: "Forex", href: "/forex", icon: "Globe" },
  { label: "Budgeting", href: "/budgeting", icon: "PieChart" },
  { label: "Family", href: "/family", icon: "Users" },
  { label: "Rewards", href: "/rewards", icon: "Gift" },
] as const
