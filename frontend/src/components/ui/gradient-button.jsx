import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const gradientButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation shadow-sm hover:shadow-md relative overflow-hidden",
  {
    variants: {
      variant: {
        orange: "bg-gradient-to-r from-orange-400 via-primary to-orange-600 text-white hover:from-orange-500 hover:via-orange-600 hover:to-orange-700 shadow-orange-500/25 hover:shadow-orange-600/40",
        sunset: "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 shadow-red-500/25 hover:shadow-red-600/40",
        ocean: "bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 text-white hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 shadow-blue-500/25 hover:shadow-blue-600/40",
        forest: "bg-gradient-to-r from-green-500 via-green-600 to-emerald-500 text-white hover:from-green-600 hover:via-green-700 hover:to-emerald-600 shadow-green-500/25 hover:shadow-green-600/40",
        royal: "bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 text-white hover:from-purple-600 hover:via-purple-700 hover:to-indigo-600 shadow-purple-500/25 hover:shadow-purple-600/40",
        fire: "bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 shadow-orange-500/25 hover:shadow-orange-600/40",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-primary hover:bg-white/20 shadow-lg hover:shadow-xl",
        neon: "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white hover:from-cyan-500 hover:via-blue-600 hover:to-purple-700 shadow-blue-500/25 hover:shadow-blue-600/40 animate-pulse",
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
      variant: "orange",
      size: "default",
    },
  }
)

const GradientButton = React.forwardRef(({ className, variant, size, asChild = false, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  
  return (
    <Comp
      className={cn(gradientButtonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    >
      {/* Shine effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      
      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </Comp>
  )
})
GradientButton.displayName = "GradientButton"

export { GradientButton, gradientButtonVariants }
