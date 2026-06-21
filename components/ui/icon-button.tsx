"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import * as React from "react"
import { Loader2 } from "lucide-react"
import type { VariantProps } from "class-variance-authority"

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  icon?: React.ReactNode
  loading?: boolean
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, asChild, icon, loading, children, ...props }, ref) => {
    return (
      <Button
        className={cn("gap-1.5", className)}
        variant={variant}
        size={size}
        asChild={asChild}
        ref={ref}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
            <span>{children}</span>
          </>
        )}
      </Button>
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton }
