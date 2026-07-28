"use client"

import { useEffect } from "react"
import { useUserStore } from "@/store/user-store"
import { usePathname, useRouter } from "next/navigation"

const publicPaths = ["/login", "/signup", "/forgot-password", "/"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchMe, isAuthLoading, user } = useUserStore()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    fetchMe()
  }, [])

  useEffect(() => {
    if (!isAuthLoading && !user && !publicPaths.includes(pathname)) {
      router.push("/login")
    }
  }, [isAuthLoading, user, pathname, router])

  if (isAuthLoading && !publicPaths.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] dark:bg-[#0a0a14]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
            <span className="text-white font-bold">R</span>
          </div>
          <div className="h-1.5 w-24 rounded-full bg-[#e8eaed] dark:bg-[#2a2a45] overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-[#5046e5] animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return children
}
