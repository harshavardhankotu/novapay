import { create } from "zustand"
import type { User, Account, Card, Transaction } from "@/types"

interface UserState {
  user: User | null
  accounts: Account[]
  cards: Card[]
  transactions: Transaction[]
  isLoading: boolean
  setUser: (user: User | null) => void
  setAccounts: (accounts: Account[]) => void
  setCards: (cards: Card[]) => void
  setTransactions: (transactions: Transaction[]) => void
  setLoading: (loading: boolean) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  accounts: [],
  cards: [],
  transactions: [],
  isLoading: false,
  setUser: (user) => set({ user }),
  setAccounts: (accounts) => set({ accounts }),
  setCards: (cards) => set({ cards }),
  setTransactions: (transactions) => set({ transactions }),
  setLoading: (isLoading) => set({ isLoading }),
}))
