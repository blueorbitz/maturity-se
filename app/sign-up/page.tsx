import { getSession } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth-form"

export default async function SignUpPage() {
  const session = await getSession()
  if (session?.user) redirect("/dashboard")
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <AuthForm mode="sign-up" />
    </main>
  )
}
