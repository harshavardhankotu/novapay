import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[#6c5ce7] text-white hover:bg-[#5a4bd1] shadow-sm",
        destructive: "bg-[#d63031] text-white hover:bg-[#b71c1c]",
        secondary: "bg-[#00cec9] text-white hover:bg-[#00b894]",
        success: "bg-[#00b894] text-white hover:bg-[#00a381]",
        outline: "border border-[#dfe6e9] bg-transparent hover:bg-[#f8f9fa] dark:hover:bg-[#1a1a2e]",
        ghost: "hover:bg-[#f8f9fa] dark:hover:bg-[#1a1a2e]",
        link: "text-[#6c5ce7] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
