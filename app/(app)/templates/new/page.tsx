import { getLlmKeyInfo } from "@/app/actions/llm-keys"
import { NewTemplateForm } from "@/components/new-template-form"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function NewTemplatePage() {
  const keyInfo = await getLlmKeyInfo()

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground -ml-1">
          <Link href="/templates">
            <ChevronLeft className="h-4 w-4 mr-1" /> Templates
          </Link>
        </Button>
      </div>
      <PageHeader
        title="New Template"
        description="Define your assessment scope and generate a questionnaire template with AI or build one manually."
      />
      <NewTemplateForm hasLlmKey={!!keyInfo} />
    </div>
  )
}
