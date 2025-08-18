import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const statsCardVariants = cva(
  "rounded-lg p-6 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-900 border border-orange-100 dark:border-gray-700",
        primary: "bg-gradient-to-br from-primary to-orange-600 text-white shadow-md",
        secondary: "bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 border border-orange-200 dark:border-orange-700",
        success: "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md",
        warning: "bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900 shadow-md",
        info: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md",
        glass: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-xl",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const StatsCard = React.forwardRef(({ className, variant, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(statsCardVariants({ variant }), className)}
    {...props}
  >
    {children}
  </div>
))
StatsCard.displayName = "StatsCard"

const StatsCardIcon = React.forwardRef(({ className, variant = "default", children, ...props }, ref) => {
  const iconVariants = {
    default: "w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center shadow-md text-primary",
    primary: "w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shadow-md text-white",
    secondary: "w-12 h-12 rounded-xl bg-gradient-to-br from-orange-200 to-orange-300 dark:from-orange-800/50 dark:to-orange-700/50 flex items-center justify-center shadow-md text-orange-700 dark:text-orange-200",
    success: "w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shadow-md text-white",
    warning: "w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shadow-md text-yellow-900",
    info: "w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shadow-md text-white",
    glass: "w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-md text-primary",
  }

  return (
    <div
      ref={ref}
      className={cn(iconVariants[variant], className)}
      {...props}
    >
      {children}
    </div>
  )
})
StatsCardIcon.displayName = "StatsCardIcon"

const StatsCardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-start justify-between mb-4", className)}
    {...props}
  />
))
StatsCardHeader.displayName = "StatsCardHeader"

const StatsCardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 min-w-0 ml-4", className)}
    {...props}
  />
))
StatsCardContent.displayName = "StatsCardContent"

const StatsCardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1", className)}
    {...props}
  />
))
StatsCardTitle.displayName = "StatsCardTitle"

const StatsCardValue = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-2xl font-bold text-gray-900 dark:text-white mb-2", className)}
    {...props}
  />
))
StatsCardValue.displayName = "StatsCardValue"

const StatsCardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-wrap items-center gap-2", className)}
    {...props}
  />
))
StatsCardDescription.displayName = "StatsCardDescription"

export {
  StatsCard,
  StatsCardIcon,
  StatsCardHeader,
  StatsCardContent,
  StatsCardTitle,
  StatsCardValue,
  StatsCardDescription,
}
