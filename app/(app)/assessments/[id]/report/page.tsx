import { db } from '@/lib/db'
import { assessments, responses, templates } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { MaturityReport } from '@/components/maturity-report'

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const { id } = await params

  const assessment = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.id, id), eq(assessments.userId, session.user.id)))
    .limit(1)
    .then((r) => r[0])

  if (!assessment) notFound()

  const template = await db
    .select()
    .from(templates)
    .where(eq(templates.id, assessment.templateId))
    .limit(1)
    .then((r) => r[0])

  if (!template) notFound()

  const allResponses = await db
    .select()
    .from(responses)
    .where(eq(responses.assessmentId, id))

  const domains = template.domains as { name: string; questions: { id: string; text: string; weight: number }[] }[]
  const scaleLevels = template.scaleLevels as { level: number; label: string; description: string }[]

  // Aggregate scores per domain
  const domainScores = domains.map((domain) => {
    const questionScores = domain.questions.map((q) => {
      const vals = allResponses
        .map((r) => {
          const a = r.answers as Record<string, number>
          return a[q.id]
        })
        .filter((v) => v !== undefined && v !== null)

      const avg = vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : 0
      return { questionId: q.id, questionText: q.text, avg: parseFloat(avg.toFixed(2)), count: vals.length }
    })

    const domainAvg =
      questionScores.length > 0
        ? parseFloat((questionScores.reduce((s, q) => s + q.avg, 0) / questionScores.length).toFixed(2))
        : 0

    return { name: domain.name, avg: domainAvg, questions: questionScores }
  })

  // Score distribution across all questions
  const scoreDistribution = Array.from({ length: template.scaleLength }, (_, i) => i + 1).map((level) => {
    const count = allResponses.reduce((sum, r) => {
      const a = r.answers as Record<string, number>
      return sum + Object.values(a).filter((v) => v === level).length
    }, 0)
    const lv = scaleLevels.find((l) => l.level === level)
    return { level, label: lv?.label ?? `Level ${level}`, count }
  })

  // Per-respondent overall averages
  const respondentAverages = allResponses.map((r) => {
    const a = r.answers as Record<string, number>
    const vals = Object.values(a)
    const avg = vals.length > 0 ? parseFloat((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2)) : 0
    return {
      name: r.respondentName ?? 'Anonymous',
      role: r.respondentRole ?? '',
      avg,
      submittedAt: r.submittedAt.toISOString(),
    }
  })

  return (
    <MaturityReport
      assessment={{
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        teamName: assessment.teamName,
        status: assessment.status,
        dueDate: assessment.dueDate ? assessment.dueDate.toISOString() : null,
      }}
      template={{
        title: template.title,
        topic: template.topic,
        scaleLength: template.scaleLength,
        scaleLevels,
      }}
      domainScores={domainScores}
      scoreDistribution={scoreDistribution}
      respondentAverages={respondentAverages}
      totalResponses={allResponses.length}
    />
  )
}
