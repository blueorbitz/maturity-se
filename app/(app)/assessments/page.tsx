import { getMyAssessments } from "@/app/actions/assessments"
import { PageHeader } from "@/components/page-header"
import { AssessmentCard } from "@/components/assessment-card"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function AssessmentsPage() {
  const assessments = await getMyAssessments()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Assessments"
        description="Distribute maturity questionnaires to your teams and track responses"
        actions={
          <IconButton size="sm" icon={<Plus className="h-4 w-4" />}>
            <Link href="/assessments/new" className="gap-1.5">
              New Assessment
            </Link>
          </IconButton>
        }
      />

      {assessments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-base font-semibold mb-1">No assessments yet</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            Send a maturity questionnaire to your team and start collecting responses.
          </p>
          <Button>
            <Link href="/assessments/new">Create your first assessment</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.map((a) => (
            <AssessmentCard key={a.id} assessment={a} />
          ))}
        </div>
      )}
    </div>
  )
}
