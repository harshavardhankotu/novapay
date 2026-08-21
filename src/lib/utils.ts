import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string, format: "short" | "long" | "relative" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date
  if (format === "relative") {
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
  }
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: format === "long" ? "long" : "short",
    year: "numeric",
  })
}

export function maskAccountNumber(num: string): string {
  return `xxxx${num.slice(-4)}`
}

export function maskUpiHandle(handle: string): string {
  const [name] = handle.split("@")
  return `${name.slice(0, 2)}***@${handle.split("@")[1]}`
}

export function generateAccountNumber(): string {
  return `NOVA${Math.random().toString(36).slice(2, 8).toUpperCase()}${Date.now().toString().slice(-6)}`
}

export function generateUpiHandle(name: string): string {
  return `${name.toLowerCase().replace(/\s+/g, "")}@novapay`
}
