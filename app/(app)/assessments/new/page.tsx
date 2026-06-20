import { getMyTemplates } from "@/app/actions/templates"
import { NewAssessmentForm } from "@/components/new-assessment-form"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function NewAssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ templateId?: string }>
}) {
  const { templateId } = await searchParams
  const templates = await getMyTemplates()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-4">
        <IconButton
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground -ml-1"
        >
          <Link href="/assessments" className="gap-1.5">
            <ChevronLeft className="h-4 w-4" />
            Assessments
          </Link>
        </IconButton>
      </div>
      <PageHeader
        title="New Assessment"
        description="Distribute a questionnaire to your team and start collecting maturity responses."
      />
      <NewAssessmentForm
        templates={templates.map((t) => ({ id: t.id, title: t.title, topic: t.topic }))}
        defaultTemplateId={templateId}
      />
    </div>
  )
}
