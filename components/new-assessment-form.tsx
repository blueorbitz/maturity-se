"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createAssessment } from "@/app/actions/assessments"
import posthog from "posthog-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface Props {
  templates: Array<{ id: string; title: string; topic: string }>
  defaultTemplateId?: string
}

export function NewAssessmentForm({ templates, defaultTemplateId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [templateId, setTemplateId] = useState(defaultTemplateId ?? "")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [teamName, setTeamName] = useState("")
  const [dueDate, setDueDate] = useState("")

  const canSubmit = templateId && title.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const { id } = await createAssessment({
        templateId,
        title,
        description: description || undefined,
        teamName: teamName || undefined,
        dueDate: dueDate || undefined,
      })
      posthog.capture('assessment_created')
      router.push(`/assessments/${id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create assessment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="template">Template <span className="text-destructive">*</span></Label>
            {templates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You need to <a href="/templates/new" className="text-primary underline">create a template</a> first.
              </p>
            ) : (
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title} <span className="text-muted-foreground">({t.topic})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assess-title">Assessment title <span className="text-destructive">*</span></Label>
            <Input
              id="assess-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Platform Team DevSecOps Assessment — Q3 2025"
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team">Team name</Label>
            <Input
              id="team"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Platform Engineering"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions or context for respondents..."
              rows={3}
              maxLength={1000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due">Due date</Label>
            <Input
              id="due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
          )}

          <Button type="submit" disabled={!canSubmit || loading} className="w-full">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Assessment
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
