"use client"

import { create } from "zustand"
import type { User, Account, Card, Transaction } from "@/types"

interface UserState {
  user: User | null
  accounts: Account[]
  cards: Card[]
  transactions: Transaction[]
  isLoading: boolean
  isAuthLoading: boolean
  setUser: (user: User | null) => void
  setAccounts: (accounts: Account[]) => void
  setCards: (cards: Card[]) => void
  setTransactions: (transactions: Transaction[]) => void
  setLoading: (loading: boolean) => void
  setAuthLoading: (loading: boolean) => void
  login: (email: string, password: string, otpCode?: string, ticket?: string) => Promise<{ success: boolean; error?: string; requiresOtp?: boolean; ticket?: string; demoOtp?: string; maskedContact?: string; method?: string }>
  signup: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  accounts: [],
  cards: [],
  transactions: [],
  isLoading: false,
  isAuthLoading: true,

  setUser: (user) => set({ user }),
  setAccounts: (accounts) => set({ accounts }),
  setCards: (cards) => set({ cards }),
  setTransactions: (transactions) => set({ transactions }),
  setLoading: (isLoading) => set({ isLoading }),
  setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),

  login: async (email, password, otpCode, ticket) => {
    try {
      const body: Record<string, unknown> = { email, password }
      if (otpCode && ticket) { body.otpCode = otpCode; body.ticket = ticket }
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.error || "Login failed" }
      if (data.requiresOtp) {
        return {
          success: false,
          requiresOtp: true,
          ticket: data.ticket,
          demoOtp: data.demoOtp,
          maskedContact: data.maskedContact,
          method: data.method,
        }
      }
      set({ user: data.user, isAuthLoading: false })
      return { success: true }
    } catch {
      return { success: false, error: "Network error" }
    }
  },

  signup: async (name, email, phone, password) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.error || "Signup failed" }
      set({ user: data.user, accounts: data.user?.account ? [data.user.account] : [], isAuthLoading: false })
      return { success: true }
    } catch {
      return { success: false, error: "Network error" }
    }
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    set({ user: null, accounts: [], cards: [], transactions: [] })
  },

  fetchMe: async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (!res.ok) { set({ isAuthLoading: false }); return }
      const data = await res.json()
      const allCards = data.accounts?.flatMap((a: any) => a.cards || []) || []
      set({
        user: { id: data.id, name: data.name, email: data.email, phone: data.phone, kycLevel: data.kycLevel, status: data.status, createdAt: new Date() },
        accounts: data.accounts || [],
        cards: allCards,
        isAuthLoading: false,
      })
    } catch {
      set({ isAuthLoading: false })
    }
  },
}))
