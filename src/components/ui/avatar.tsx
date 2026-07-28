import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
}

function Avatar({ className, src, alt, fallback, size = "md", ...props }: AvatarProps) {
  return (
    <div className={cn("relative rounded-full overflow-hidden shrink-0", sizeMap[size], className)} {...props}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#6c5ce7] text-white font-medium">
          {fallback?.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  )
}

export { Avatar }
