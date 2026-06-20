'use server'

import { db } from '@/lib/db'
import { assessments, templates } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { RespondForm } from '@/components/respond-form'

export default async function RespondPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const assessment = await db
    .select()
    .from(assessments)
    .where(eq(assessments.inviteToken, token))
    .limit(1)
    .then((r) => r[0])

  if (!assessment) notFound()
  if (assessment.status === 'closed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md text-center px-6 py-12">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Assessment Closed</h1>
          <p className="text-muted-foreground text-sm">This assessment is no longer accepting responses.</p>
        </div>
      </div>
    )
  }

  const template = await db
    .select()
    .from(templates)
    .where(eq(templates.id, assessment.templateId))
    .limit(1)
    .then((r) => r[0])

  if (!template) notFound()

  return (
    <RespondForm
      assessment={{
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        teamName: assessment.teamName,
        dueDate: assessment.dueDate ? assessment.dueDate.toISOString() : null,
      }}
      template={{
        title: template.title,
        topic: template.topic,
        targetAudience: template.targetAudience,
        scaleLength: template.scaleLength,
        scaleLevels: template.scaleLevels as { level: number; label: string; description: string }[],
        domains: template.domains as { name: string; questions: { id: string; text: string }[] }[],
      }}
    />
  )
}
