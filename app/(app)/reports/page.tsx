import { getMyAssessments } from "@/app/actions/assessments"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { BarChart2, ChevronRight, ClipboardList } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function ReportsPage() {
  const assessments = await getMyAssessments()
  // Only show assessments that have been activated (may have responses)
  const reportable = assessments.filter((a) => a.status !== "draft")
  const drafts = assessments.filter((a) => a.status === "draft")

  const statusColors = {
    draft: "bg-muted text-muted-foreground",
    active: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    closed: "bg-secondary text-secondary-foreground",
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Reports"
        description="View maturity analysis and aggregated scores for your assessments"
      />

      {assessments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
            <BarChart2 className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground mb-1">No assessments yet</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            Create and activate an assessment to start collecting responses and viewing reports.
          </p>
          <IconButton
            size="sm"
            icon={<ClipboardList className="h-4 w-4" />}
          >
            <Link href="/assessments/new" className="gap-1.5">
              Create an assessment
            </Link>
          </IconButton>
        </div>
      ) : (
        <div className="space-y-8">
          {reportable.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Active &amp; Closed Assessments
              </h2>
              <div className="space-y-2">
                {reportable.map((a) => (
                  <Link
                    key={a.id}
                    href={`/assessments/${a.id}/report`}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:shadow-sm hover:border-primary/30 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center shrink-0">
                      <BarChart2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {a.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {a.teamName ? `${a.teamName} · ` : ""}
                        {formatDistanceToNow(a.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusColors[a.status]}`}
                    >
                      {a.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {drafts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Draft Assessments
              </h2>
              <div className="space-y-2">
                {drafts.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/30 opacity-60"
                  >
                    <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center shrink-0">
                      <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Activate this assessment to generate a report
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Link href={`/assessments/${a.id}`}>Activate</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
