"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveTemplate } from "@/app/actions/templates"
import posthog from "posthog-js"
import { TemplateEditor } from "@/components/template-editor"
import type { Domain, ScaleLevel } from "@/lib/db/schema"

interface Props {
  templateId: string
  initialData: {
    title: string
    topic: string
    context?: string
    targetAudience: string
    scaleLength: number
    scaleLevels: ScaleLevel[]
    domains: Domain[]
    generatedByAi: boolean
    visibility?: "private" | "public"
  }
}

export function TemplateEditorPage({ templateId, initialData }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(data: typeof initialData) {
    setSaving(true)
    setError(null)
    try {
      const prevVisibility = initialData.visibility ?? 'private'
      const newVisibility = data.visibility ?? 'private'
      await saveTemplate({
        id: templateId,
        title: data.title,
        topic: data.topic,
        context: data.context,
        targetAudience: data.targetAudience,
        scaleLength: data.scaleLength,
        scaleLevels: data.scaleLevels,
        domains: data.domains,
        visibility: newVisibility,
        generatedByAi: data.generatedByAi,
      })
      if (prevVisibility !== newVisibility) {
        posthog.capture('template_visibility_changed', { from: prevVisibility, to: newVisibility })
      }
      router.push(`/templates/${templateId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <TemplateEditor
      initialData={initialData}
      onSave={handleSave}
      saving={saving}
      error={error}
    />
  )
}
