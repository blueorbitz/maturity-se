"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cloneTemplate } from "@/app/actions/templates"
import { TemplateCard } from "@/components/template-card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Globe } from "lucide-react"

type Template = {
  id: string
  title: string
  topic: string
  targetAudience: string
  scaleLength: number
  visibility: "private" | "public"
  generatedByAi: boolean
  clonedFromId: string | null
  domains: Array<{ id: string; name: string; questions: unknown[] }>
  updatedAt: Date
}

const ALL = "All"

export function GalleryClient({ templates }: { templates: Template[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [activeTopic, setActiveTopic] = useState(ALL)
  const [cloning, setCloning] = useState<string | null>(null)

  const topics = [ALL, ...Array.from(new Set(templates.map((t) => t.topic))).sort()]

  const filtered = templates.filter((t) => {
    const matchesTopic = activeTopic === ALL || t.topic === activeTopic
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.topic.toLowerCase().includes(search.toLowerCase()) ||
      t.targetAudience.toLowerCase().includes(search.toLowerCase())
    return matchesTopic && matchesSearch
  })

  async function handleClone(id: string) {
    setCloning(id)
    try {
      const { id: newId } = await cloneTemplate(id)
      router.push(`/templates/${newId}/edit`)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Clone failed")
    } finally {
      setCloning(null)
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {topics.map((t) => (
            <Badge
              key={t}
              variant={activeTopic === t ? "default" : "outline"}
              className="cursor-pointer select-none"
              onClick={() => setActiveTopic(t)}
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Globe className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No templates found</p>
          <p className="text-sm text-muted-foreground">
            {templates.length === 0
              ? "No public templates have been shared yet. Publish your own templates to share them here."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onClone={cloning === t.id ? undefined : handleClone}
            />
          ))}
        </div>
      )}
    </div>
  )
}
