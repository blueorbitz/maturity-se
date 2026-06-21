import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { llmKeys, promoCodes, promoCodeRedemptions, llmUsageLog, user } from '@/lib/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { PageHeader } from '@/components/page-header'
import { SettingsClient } from '@/components/settings-client'

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const existing = await db
    .select()
    .from(llmKeys)
    .where(eq(llmKeys.userId, session.user.id))
    .limit(1)
    .then((r) => r[0] ?? null)

  const [userRow] = await db
    .select({ defaultLlmMode: user.defaultLlmMode })
    .from(user)
    .where(eq(user.id, session.user.id))

  const defaultLlmMode = userRow?.defaultLlmMode ?? 'own_key'

  const [grantedResult] = await db
    .select({
      total: sql<number>`coalesce(sum(${promoCodes.generations}), 0)`,
    })
    .from(promoCodeRedemptions)
    .innerJoin(promoCodes, eq(promoCodeRedemptions.promoCodeId, promoCodes.id))
    .where(eq(promoCodeRedemptions.userId, session.user.id))

  const totalGranted = Number(grantedResult?.total ?? 0)

  const [usedResult] = await db
    .select({
      total: sql<number>`coalesce(count(*), 0)`,
    })
    .from(llmUsageLog)
    .where(
      and(
        eq(llmUsageLog.userId, session.user.id),
        eq(llmUsageLog.provider, "platform")
      )
    )

  const used = Number(usedResult?.total ?? 0)
  const creditsRemaining = totalGranted - used

  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b border-border/60 bg-card">
        <div className="max-w-3xl mx-auto px-6">
          <PageHeader
            title="Settings"
            description="Configure your LLM provider for AI-assisted template generation."
          />
        </div>
      </div>
      <SettingsClient
        defaultLlmMode={defaultLlmMode}
        hasLlmKey={!!existing}
        creditsRemaining={creditsRemaining}
        llmKeyExisting={
          existing
            ? {
                provider: existing.provider,
                keyHint: existing.keyHint,
                model: existing.model,
                apiFormat: existing.apiFormat,
                awsRegion: existing.awsRegion,
                awsAccessKeyId: existing.awsAccessKeyId,
              }
            : null
        }
      />
    </div>
  )
}
