import { getTemplateById } from "@/app/actions/templates"
import { notFound } from "next/navigation"
import { TemplateEditorPage } from "@/components/template-editor-page"
import { IconButton } from "@/components/ui/icon-button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const template = await getTemplateById(id)
  if (!template) notFound()

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <IconButton
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground -ml-1"
        >
          <Link href={`/templates/${id}`} className="gap-1.5">
            <ChevronLeft className="h-4 w-4" />
            Back to template
          </Link>
        </IconButton>
      </div>
      <h1 className="text-xl font-semibold mb-6">Edit Template</h1>
      <TemplateEditorPage
        templateId={id}
        initialData={{
          title: template.title,
          topic: template.topic,
          context: template.context ?? undefined,
          targetAudience: template.targetAudience,
          scaleLength: template.scaleLength,
          scaleLevels: template.scaleLevels as Array<{ level: number; label: string; description: string }>,
          domains: template.domains as Array<{ id: string; name: string; questions: Array<{ id: string; text: string; type: "scale" | "text" }> }>,
          generatedByAi: template.generatedByAi,
          visibility: template.visibility as "private" | "public",
        }}
      />
    </div>
  )
}
