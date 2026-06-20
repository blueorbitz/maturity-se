import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { llmKeys } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { PageHeader } from '@/components/page-header'
import { LlmKeyForm } from '@/components/llm-key-form'

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const existing = await db
    .select()
    .from(llmKeys)
    .where(eq(llmKeys.userId, session.user.id))
    .limit(1)
    .then((r) => r[0] ?? null)

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
      <div className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
        <LlmKeyForm
          existing={
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
    </div>
  )
}
