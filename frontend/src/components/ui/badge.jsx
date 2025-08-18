import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary to-orange-600 text-white shadow-lg hover:from-orange-600 hover:to-orange-700",
        secondary:
          "border border-orange-300 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 hover:from-orange-200 hover:to-orange-300",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:from-red-600 hover:to-red-700",
        outline: "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white",
        success:
          "border-transparent bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:from-green-600 hover:to-green-700",
        warning:
          "border-transparent bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 shadow-lg hover:from-yellow-500 hover:to-yellow-600",
        info:
          "border-transparent bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700",
        glass:
          "bg-white/20 backdrop-blur-md border border-white/30 text-gray-800 dark:text-white shadow-lg hover:bg-white/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
