import { getMyTemplates } from "@/app/actions/templates"
import { getMyAssessments } from "@/app/actions/assessments"
import { getLlmKeyInfo } from "@/app/actions/llm-keys"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, ClipboardList, Globe, AlertTriangle, ArrowRight } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function DashboardPage() {
  const [templates, assessments, keyInfo] = await Promise.all([
    getMyTemplates(),
    getMyAssessments(),
    getLlmKeyInfo(),
  ])

  const publicTemplates = templates.filter((t) => t.visibility === "public")
  const activeAssessments = assessments.filter((a) => a.status === "active")
  const recentTemplates = templates.slice(0, 5)
  const recentAssessments = assessments.slice(0, 5)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Dashboard"
        description="Overview of your maturity assessments and templates"
        actions={
          <IconButton size="sm" icon={<Plus className="h-4 w-4" />}>
            <Link href="/templates/new" className="gap-1.5">
              New Template
            </Link>
          </IconButton>
        }
      />

      {!keyInfo && (
        <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="text-sm">
            <span className="font-medium">LLM key not configured.</span>
            {" AI-assisted template generation requires an API key. "}
            <Link href="/settings" className="underline font-medium">Configure in Settings</Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="My Templates" value={templates.length} icon={FileText} description="Total created" />
        <StatCard label="Public Templates" value={publicTemplates.length} icon={Globe} description="Shared publicly" />
        <StatCard label="Assessments" value={assessments.length} icon={ClipboardList} description="Total sent" />
        <StatCard label="Active" value={activeAssessments.length} icon={ClipboardList} description="Collecting responses" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Templates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">Recent Templates</CardTitle>
            <IconButton size="sm" variant="ghost" icon={<ArrowRight className="ml-1 h-3 w-3" />}>
              <Link href="/templates" className="gap-1.5">
                View all
              </Link>
            </IconButton>
          </CardHeader>
          <CardContent className="pt-0">
            {recentTemplates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-3">No templates yet</p>
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={<Plus className="h-3.5 w-3.5 mr-1.5" />}
                >
                  <Link href="/templates/new" className="gap-1.5">
                    Create one
                  </Link>
                </IconButton>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTemplates.map((t) => (
                  <Link
                    key={t.id}
                    href={`/templates/${t.id}`}
                    className="flex items-center justify-between p-2.5 rounded-md hover:bg-muted/50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.topic} · {formatDistanceToNow(t.updatedAt, { addSuffix: true })}</p>
                    </div>
                    <Badge variant={t.visibility === "public" ? "default" : "secondary"} className="ml-2 shrink-0 text-xs">
                      {t.visibility}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Assessments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">Recent Assessments</CardTitle>
            <IconButton size="sm" variant="ghost" icon={<ArrowRight className="ml-1 h-3 w-3" />}>
              <Link href="/assessments" className="gap-1.5">
                View all
              </Link>
            </IconButton>
          </CardHeader>
          <CardContent className="pt-0">
            {recentAssessments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-3">No assessments yet</p>
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={<Plus className="h-3.5 w-3.5 mr-1.5" />}
                >
                  <Link href="/assessments/new" className="gap-1.5">
                    Create one
                  </Link>
                </IconButton>
              </div>
            ) : (
              <div className="space-y-2">
                {recentAssessments.map((a) => (
                  <Link
                    key={a.id}
                    href={`/assessments/${a.id}`}
                    className="flex items-center justify-between p-2.5 rounded-md hover:bg-muted/50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.teamName ?? "No team"} · {formatDistanceToNow(a.createdAt, { addSuffix: true })}</p>
                    </div>
                    <Badge
                      variant={a.status === "active" ? "default" : a.status === "closed" ? "secondary" : "outline"}
                      className="ml-2 shrink-0 text-xs"
                    >
                      {a.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
