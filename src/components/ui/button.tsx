import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5046e5] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary: "bg-[#5046e5] text-white hover:bg-[#4038c9] shadow-lg shadow-[#5046e5]/20",
        secondary: "bg-[#00cec9] text-white hover:bg-[#00b894] shadow-lg shadow-[#00cec9]/20",
        success: "bg-[#00b894] text-white hover:bg-[#00a381]",
        warning: "bg-[#fdcb6e] text-[#2d3436] hover:bg-[#f0c060]",
        destructive: "bg-[#d63031] text-white hover:bg-[#b71c1c]",
        outline: "border border-[#e8eaed] dark:border-[#2a2a45] bg-transparent hover:bg-[#f5f6fa] dark:hover:bg-[#1a1a30]",
        ghost: "hover:bg-[#f5f6fa] dark:hover:bg-[#1a1a30] text-[#636e72] hover:text-[#1a1a2e] dark:hover:text-white",
        link: "text-[#5046e5] underline-offset-4 hover:underline",
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
