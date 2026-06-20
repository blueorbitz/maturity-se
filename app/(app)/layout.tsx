import { getSession } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session?.user) redirect("/sign-in")

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar user={{ name: session.user.name, email: session.user.email }} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
