import { getPublicTemplates, cloneTemplate } from "@/app/actions/templates"
import { PageHeader } from "@/components/page-header"
import { GalleryClient } from "@/components/gallery-client"

export default async function GalleryPage() {
  const templates = await getPublicTemplates()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Public Template Gallery"
        description="Browse community-shared maturity assessment templates. Clone any template to create your own editable copy."
      />
      <GalleryClient templates={templates} />
    </div>
  )
}
