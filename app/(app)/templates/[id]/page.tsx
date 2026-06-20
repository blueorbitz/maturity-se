import { getTemplateById } from "@/app/actions/templates"
import { notFound } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, Globe, Lock } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { Pencil, ClipboardList } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const template = await getTemplateById(id)
  if (!template) notFound()

  const totalQuestions = template.domains.reduce((sum: number, d: { questions: unknown[] }) => sum + d.questions.length, 0)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <IconButton
          variant="ghost"
          size="sm"
          className="text-muted-foreground -ml-1"
          icon={<ChevronLeft className="h-4 w-4" />}
        >
          <Link href="/templates" className="gap-1.5">
            Templates
          </Link>
        </IconButton>
      </div>

      <PageHeader
        title={template.title}
        description={`${template.topic} · ${template.targetAudience}`}
        actions={
          <div className="flex gap-2">
            <IconButton variant="outline" size="sm" icon={<ClipboardList className="h-4 w-4" />}>
              <Link href={`/assessments/new?templateId=${template.id}`} className="gap-1.5">
                Send Assessment
              </Link>
            </IconButton>
            <IconButton size="sm" icon={<Pencil className="h-4 w-4" />}>
              <Link href={`/templates/${template.id}/edit`} className="gap-1.5">
                Edit
              </Link>
            </IconButton>
          </div>
        }
      />

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Badge variant={template.visibility === "public" ? "default" : "secondary"}>
          {template.visibility === "public"
            ? <><Globe className="h-3 w-3 mr-1" />Public</>
            : <><Lock className="h-3 w-3 mr-1" />Private</>}
        </Badge>
        {template.generatedByAi && <Badge variant="outline" className="border-primary/30 text-primary">AI Generated</Badge>}
        {template.clonedFromId && <Badge variant="outline">Cloned</Badge>}
        <span className="text-xs text-muted-foreground ml-auto">
          Updated {formatDistanceToNow(template.updatedAt, { addSuffix: true })}
        </span>
      </div>

      {/* Scale */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Maturity Scale — {template.scaleLength} levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {(template.scaleLevels as Array<{ level: number; label: string; description: string }>).map((level) => (
              <div key={level.level} className="flex-1 min-w-[120px] max-w-[200px] rounded-md border border-border p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {level.level}
                  </span>
                  <span className="text-sm font-medium text-foreground">{level.label}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{level.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground mb-6">
        <span><strong className="text-foreground">{template.domains.length}</strong> domains</span>
        <span><strong className="text-foreground">{totalQuestions}</strong> questions</span>
        {template.context && <span className="truncate max-w-xs">{template.context}</span>}
      </div>

      {/* Domains & questions */}
      <div className="space-y-4">
        {(template.domains as Array<{ id: string; name: string; questions: Array<{ id: string; text: string; type: string }> }>).map((domain, di) => (
          <Card key={domain.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {di + 1}
                </span>
                {domain.name}
                <Badge variant="secondary" className="ml-auto text-xs">{domain.questions.length} questions</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Separator className="mb-3" />
              <ol className="space-y-2">
                {domain.questions.map((q, qi) => (
                  <li key={q.id} className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground w-5 shrink-0 text-right">{qi + 1}.</span>
                    <span className="flex-1 text-foreground leading-relaxed">{q.text}</span>
                    <Badge variant="outline" className="text-xs shrink-0">{q.type}</Badge>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
