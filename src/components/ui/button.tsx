import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a33d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071a26] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-[#e8a33d] to-[#f2bd68] text-[#1a1206] hover:from-[#d18a24] hover:to-[#e0a64a] shadow-lg shadow-[#e8a33d]/25",
        secondary: "bg-gradient-to-r from-[#2dd4bf] to-[#14a390] text-[#071a26] hover:from-[#22c2ab] hover:to-[#0f8f80] shadow-lg shadow-[#2dd4bf]/20",
        success: "bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-[#071a26] hover:from-[#22c55e] hover:to-[#16a34a]",
        warning: "bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#071a26] hover:from-[#f59e0b] hover:to-[#d97706]",
        destructive: "bg-gradient-to-r from-[#f87171] to-[#ef4444] text-white hover:from-[#ef4444] hover:to-[#b91c1c]",
        outline: "border border-[#1e3d4d] bg-transparent hover:bg-[#0e2633] hover:border-[#e8a33d]/30",
        ghost: "hover:bg-[#0e2633] text-[#8ea6b6] hover:text-white",
        link: "text-[#f2bd68] underline-offset-4 hover:underline hover:text-[#f6cf8f]",
      },
      size: {
        sm: "h-9 px-3 text-xs rounded-lg",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base rounded-xl",
        xl: "h-14 px-8 text-lg rounded-xl",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
