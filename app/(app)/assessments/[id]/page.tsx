import { getAssessmentById, getAssessmentResponses, updateAssessmentStatus } from "@/app/actions/assessments"
import { getTemplateById } from "@/app/actions/templates"
import { notFound } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InviteLinkBox } from "@/components/invite-link-box"
import { AssessmentStatusControl } from "@/components/assessment-status-control"
import { User } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { ChevronLeft, BarChart2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow, format } from "date-fns"

export default async function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const assessment = await getAssessmentById(id)
  if (!assessment) notFound()

  const [template, responses] = await Promise.all([
    getTemplateById(assessment.templateId),
    getAssessmentResponses(id),
  ])

  const statusColors = {
    draft: "bg-muted text-muted-foreground",
    active: "bg-green-100 text-green-700",
    closed: "bg-secondary text-secondary-foreground",
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <IconButton
          variant="ghost"
          size="sm"
          className="text-muted-foreground -ml-1"
          icon={<ChevronLeft className="h-4 w-4" />}
        >
          <Link href="/assessments" className="gap-1.5">
            Assessments
          </Link>
        </IconButton>
      </div>

      <PageHeader
        title={assessment.title}
        description={assessment.teamName ? `Team: ${assessment.teamName}` : undefined}
        actions={
          <IconButton size="sm" variant="outline" icon={<BarChart2 className="h-4 w-4" />}>
            <Link href={`/assessments/${id}/report`} className="gap-1.5">
              View Report
            </Link>
          </IconButton>
        }
      />

      {/* Status + info row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[assessment.status]}`}>
          {assessment.status}
        </span>
        <span className="text-xs text-muted-foreground">
          Created {formatDistanceToNow(assessment.createdAt, { addSuffix: true })}
        </span>
        {assessment.dueDate && (
          <span className="text-xs text-muted-foreground">
            Due {format(assessment.dueDate, "MMM d, yyyy")}
          </span>
        )}
        {template && (
          <Link href={`/templates/${template.id}`} className="text-xs text-primary hover:underline">
            Template: {template.title}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Invite link */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Invite Link</CardTitle>
            </CardHeader>
            <CardContent>
              <InviteLinkBox token={assessment.inviteToken} status={assessment.status} />
              {assessment.description && (
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{assessment.description}</p>
              )}
            </CardContent>
          </Card>

          {/* Responses */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Responses</CardTitle>
              <Badge variant="secondary">{responses.length}</Badge>
            </CardHeader>
            <CardContent>
              {responses.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {assessment.status === "draft"
                    ? "Activate the assessment to start collecting responses."
                    : "No responses yet. Share the invite link with your team."}
                </p>
              ) : (
                <div className="space-y-2">
                  {responses.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-md bg-muted/40 text-sm">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{r.respondentName ?? "Anonymous"}</span>
                      {r.respondentRole && <span className="text-muted-foreground">· {r.respondentRole}</span>}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {formatDistanceToNow(r.submittedAt, { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar controls */}
        <div>
          <AssessmentStatusControl assessmentId={id} currentStatus={assessment.status} />
        </div>
      </div>
    </div>
  )
}
