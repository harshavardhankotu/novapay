import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#6c5ce7] text-white",
        secondary: "bg-[#dfe6e9] text-[#2d3436] dark:bg-[#2d3436] dark:text-[#dfe6e9]",
        success: "bg-[#00b894] text-white",
        warning: "bg-[#fdcb6e] text-[#2d3436]",
        destructive: "bg-[#d63031] text-white",
        outline: "border border-[#dfe6e9] text-[#636e72]",
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
