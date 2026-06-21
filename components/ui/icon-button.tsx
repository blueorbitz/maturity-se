"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import * as React from "react"
import { Loader2 } from "lucide-react"
import type { VariantProps } from "class-variance-authority"

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode
  loading?: boolean
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon, loading, children, ...props }, ref) => {
    return (
      <Button
        className={cn("gap-1.5", className)}
        variant={variant}
        size={size}
        ref={ref}
        {...props}
      >
        <>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
          <span>{children}</span>
        </>
      </Button>
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton }
