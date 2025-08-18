import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation shadow-sm hover:shadow-md",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-orange-600 text-white hover:from-orange-600 hover:to-orange-700",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white",
        secondary:
          "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 hover:from-orange-200 hover:to-orange-300 border border-orange-300",
        ghost: "hover:bg-orange-100 hover:text-orange-800 dark:hover:bg-orange-900/20 dark:hover:text-orange-200 shadow-none hover:shadow-none",
        link: "text-primary underline-offset-4 hover:underline hover:text-orange-600 shadow-none hover:shadow-none",
        gradient: "bg-gradient-to-r from-orange-400 via-primary to-orange-600 text-white hover:from-orange-500 hover:via-orange-600 hover:to-orange-700",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-primary hover:bg-white/20",
      },
      size: {
        default: "h-11 px-6 py-3 min-h-[44px]",
        sm: "h-9 px-4 py-2 min-h-[36px] text-sm",
        lg: "h-13 px-8 py-4 min-h-[52px] text-base",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px]",
        mobile: "h-12 px-6 py-3 min-h-[48px] text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
