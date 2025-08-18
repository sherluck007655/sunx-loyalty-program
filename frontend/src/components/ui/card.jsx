import * as React from "react"

import { cn } from "../../lib/utils"

const Card = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "rounded-lg border border-orange-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-card-foreground shadow-sm backdrop-blur-sm",
    primary: "rounded-lg bg-gradient-to-br from-primary via-orange-500 to-orange-600 text-white shadow-md border-0",
    secondary: "rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 text-card-foreground shadow-sm border border-orange-200 dark:border-orange-700",
    glass: "rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-md",
    stats: "rounded-lg bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-900 shadow-sm border border-orange-100 dark:border-gray-700"
  };

  return (
    <div
      ref={ref}
      className={cn(variants[variant], className)}
      {...props}
    />
  );
})
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-900/10 rounded-t-2xl border-b border-orange-100 dark:border-gray-700", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-bold leading-none tracking-tight text-gray-900 dark:text-white",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600 dark:text-gray-400 font-medium", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 bg-gradient-to-r from-orange-50/30 to-transparent dark:from-orange-900/5 rounded-b-2xl border-t border-orange-100 dark:border-gray-700", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
