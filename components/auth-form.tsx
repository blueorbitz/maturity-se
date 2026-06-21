"use client"

import { authClient } from "@/lib/auth-client"
import posthog from "posthog-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

type Mode = "sign-in" | "sign-up"

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = e.currentTarget
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    const name = mode === "sign-up"
      ? (form.elements.namedItem("name") as HTMLInputElement).value
      : undefined

    try {
      if (mode === "sign-up") {
        const res = await authClient.signUp.email({ email, password, name: name! })
        if (res.error) throw new Error(res.error.message ?? "Sign up failed")
        posthog.capture('sign_up', { method: 'email' })
      } else {
        const res = await authClient.signIn.email({ email, password })
        if (res.error) throw new Error(res.error.message ?? "Sign in failed")
        posthog.capture('sign_in', { method: 'email' })
      }
      router.push("/dashboard")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-lg border-border">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">M</span>
          </div>
          <span className="font-semibold text-sm text-muted-foreground">MaturitySE</span>
        </div>
        <CardTitle className="text-xl">
          {mode === "sign-in" ? "Welcome back" : "Create your account"}
        </CardTitle>
        <CardDescription>
          {mode === "sign-in"
            ? "Sign in to your MaturitySE workspace"
            : "Start assessing your engineering maturity"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {mode === "sign-up" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" placeholder="Jane Smith" required autoComplete="name" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="jane@example.com" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              minLength={8}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            {mode === "sign-in" ? (
              <>
                {"Don't have an account? "}
                <Link href="/sign-up" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                {"Already have an account? "}
                <Link href="/sign-in" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
