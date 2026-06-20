import { getMyTemplates } from "@/app/actions/templates"
import { PageHeader } from "@/components/page-header"
import { TemplateCard } from "@/components/template-card"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function TemplatesPage() {
  const templates = await getMyTemplates()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="My Templates"
        description="Manage your maturity assessment questionnaire templates"
        actions={
          <IconButton size="sm" icon={<Plus className="h-4 w-4" />}>
            <Link href="/templates/new" className="gap-1.5">
              New Template
            </Link>
          </IconButton>
        }
      />

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground mb-1">No templates yet</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            Create your first maturity assessment template, either from scratch or with AI assistance.
          </p>
          <Button asChild>
            <Link href="/templates/new">Create your first template</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} showActions />
          ))}
        </div>
      )}
    </div>
  )
}
