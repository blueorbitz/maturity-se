import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPromoCodes } from '@/app/actions/admin'
import { AdminPromoCodes } from '@/components/admin-promo-codes'
import { PageHeader } from '@/components/page-header'

export default async function AdminPromoCodesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const adminEmails = process.env.ADMIN_EMAILS
  if (!adminEmails) redirect('/')

  const emails = adminEmails.split(',').map((e) => e.trim().toLowerCase())
  if (!emails.includes(session.user.email.toLowerCase())) {
    redirect('/')
  }

  const codes = await getPromoCodes()

  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b border-border/60 bg-card">
        <div className="max-w-4xl mx-auto px-6">
          <PageHeader
            title="Admin — Promo Codes"
            description="Create and manage promo codes for platform credits."
          />
        </div>
      </div>
      <div className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        <AdminPromoCodes initialCodes={codes as Array<{id: string; code: string; generations: number; expiresAt: Date; createdAt: Date; redemptionCount: number | string}>} />
      </div>
    </div>
  )
}
