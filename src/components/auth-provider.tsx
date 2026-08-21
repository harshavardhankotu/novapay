"use client"

import { useEffect } from "react"
import { useUserStore } from "@/store/user-store"
import { usePathname, useRouter } from "next/navigation"
import { Ship } from "lucide-react"
import { APP_NAME } from "@/lib/constants"

const publicPaths = ["/login", "/signup", "/forgot-password", "/", "/privacy", "/terms", "/compliance"]

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
      <div className="min-h-screen flex items-center justify-center bg-[#071a26]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#e8a33d] to-[#2dd4bf] flex items-center justify-center shadow-lg shadow-[#e8a33d]/30 animate-float">
            <Ship className="h-5 w-5 text-white" />
          </div>
          <div className="h-1.5 w-24 rounded-full bg-[#1e3d4d] overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#e8a33d] to-[#2dd4bf] animate-pulse" />
          </div>
          <p className="text-xs text-[#8ea6b6]">{APP_NAME} loading...</p>
        </div>
      </div>
    )
  }

  return children
}
