import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] text-[#1a1206]",
        secondary: "bg-[#1e3d4d] text-[#8ea6b6]",
        success: "bg-[#4ade80] text-[#071a26]",
        warning: "bg-[#fbbf24] text-[#071a26]",
        destructive: "bg-[#f87171] text-white",
        outline: "border border-[#1e3d4d] text-[#8ea6b6]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
