"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import posthog from "posthog-js"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Globe,
  ClipboardList,
  BarChart2,
  Activity,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/gallery", label: "Public Gallery", icon: Globe },
  { href: "/assessments", label: "Assessments", icon: ClipboardList },
  { href: "/reports", label: "Reports", icon: BarChart2 },
  { href: "/usage", label: "Usage", icon: Activity },
]

type User = { name: string; email: string }

export function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    posthog.reset()
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-sidebar flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground text-sm font-bold">M</span>
        </div>
        <div>
          <p className="font-semibold text-sidebar-foreground text-sm leading-tight">MaturitySE</p>
          <p className="text-xs text-muted-foreground leading-tight">Engineering Maturity</p>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Main navigation">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
              {label}
              {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary" />}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* Bottom: settings + user */}
      <div className="px-3 py-3 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group",
            pathname === "/settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          )}
        >
          <Settings className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
          Settings
        </Link>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group"
        >
          <LogOut className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-destructive" />
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
