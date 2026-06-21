"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Loader2, Trash2, ChevronDown, ChevronUp, GripVertical, Save
} from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { Plus, ChevronLeft } from "lucide-react"
import type { Domain, Question, ScaleLevel } from "@/lib/db/schema"
import { nanoid } from "nanoid"

interface TemplateData {
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

interface TemplateEditorProps {
  initialData: TemplateData
  onSave: (data: TemplateData) => void
  onBack?: () => void
  saving?: boolean
  error?: string | null
}

export function TemplateEditor({ initialData, onSave, onBack, saving, error }: TemplateEditorProps) {
  const [data, setData] = useState<TemplateData>(initialData)
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>(
    Object.fromEntries(initialData.domains.map((d) => [d.id, true]))
  )

  function updateField<K extends keyof TemplateData>(key: K, value: TemplateData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function updateScaleLevel(index: number, field: keyof ScaleLevel, value: string | number) {
    const levels = [...data.scaleLevels]
    levels[index] = { ...levels[index], [field]: value }
    updateField("scaleLevels", levels)
  }

  function addDomain() {
    const id = nanoid()
    const newDomain: Domain = {
      id,
      name: "New Domain",
      questions: [{ id: nanoid(), text: "Sample question?", type: "scale" }],
    }
    setData((prev) => ({ ...prev, domains: [...prev.domains, newDomain] }))
    setExpandedDomains((prev) => ({ ...prev, [id]: true }))
  }

  function removeDomain(id: string) {
    setData((prev) => ({ ...prev, domains: prev.domains.filter((d) => d.id !== id) }))
  }

  function updateDomainName(id: string, name: string) {
    setData((prev) => ({
      ...prev,
      domains: prev.domains.map((d) => (d.id === id ? { ...d, name } : d)),
    }))
  }

  function addQuestion(domainId: string) {
    setData((prev) => ({
      ...prev,
      domains: prev.domains.map((d) =>
        d.id === domainId
          ? { ...d, questions: [...d.questions, { id: nanoid(), text: "New question?", type: "scale" }] }
          : d
      ),
    }))
  }

  function updateQuestion(domainId: string, qId: string, field: keyof Question, value: string) {
    setData((prev) => ({
      ...prev,
      domains: prev.domains.map((d) =>
        d.id === domainId
          ? {
              ...d,
              questions: d.questions.map((q) =>
                q.id === qId ? { ...q, [field]: value } : q
              ),
            }
          : d
      ),
    }))
  }

  function removeQuestion(domainId: string, qId: string) {
    setData((prev) => ({
      ...prev,
      domains: prev.domains.map((d) =>
        d.id === domainId
          ? { ...d, questions: d.questions.filter((q) => q.id !== qId) }
          : d
      ),
    }))
  }

  function moveDomain(index: number, direction: "up" | "down") {
    const domains = [...data.domains]
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= domains.length) return
    ;[domains[index], domains[target]] = [domains[target], domains[index]]
    setData((prev) => ({ ...prev, domains }))
  }

  const totalQuestions = data.domains.reduce((sum, d) => sum + d.questions.length, 0)

  return (
    <div className="space-y-6">
      {/* Top actions */}
      <div className="flex items-center justify-between gap-4">
        {onBack && (
          <IconButton
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground -ml-1"
            icon={<ChevronLeft className="h-4 w-4" />}
          >
            Back
          </IconButton>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {data.domains.length} domains · {totalQuestions} questions
          </span>
          <IconButton
            onClick={() => onSave(data)}
            disabled={saving}
            size="sm"
            icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          >
            Save Template
          </IconButton>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-sm font-semibold text-foreground">Template Details</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={data.title}
                onChange={(e) => updateField("title", e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-topic">Topic</Label>
              <Input
                id="edit-topic"
                value={data.topic}
                onChange={(e) => updateField("topic", e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-audience">Target Audience</Label>
              <Input
                id="edit-audience"
                value={data.targetAudience}
                onChange={(e) => updateField("targetAudience", e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-visibility">Visibility</Label>
              <Select
                value={data.visibility ?? "private"}
                onValueChange={(v) => updateField("visibility", v as "private" | "public")}
              >
                <SelectTrigger id="edit-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-context">Context</Label>
            <Textarea
              id="edit-context"
              value={data.context ?? ""}
              onChange={(e) => updateField("context", e.target.value)}
              rows={2}
              maxLength={2000}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scale levels */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-sm font-semibold text-foreground">
            Maturity Scale <Badge variant="secondary" className="ml-2">{data.scaleLevels.length} levels</Badge>
          </h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.scaleLevels.map((level, i) => (
            <div key={i} className="grid grid-cols-[auto_1fr_2fr] gap-2 items-start">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary mt-1 shrink-0">
                {level.level}
              </div>
              <Input
                value={level.label}
                onChange={(e) => updateScaleLevel(i, "label", e.target.value)}
                placeholder="Level label"
                maxLength={50}
              />
              <Input
                value={level.description}
                onChange={(e) => updateScaleLevel(i, "description", e.target.value)}
                placeholder="Level description"
                maxLength={200}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Domains */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Domains</h2>
          <IconButton variant="outline" size="sm" onClick={addDomain} icon={<Plus className="h-4 w-4" />}>
            Add Domain
          </IconButton>
        </div>

        {data.domains.map((domain, di) => {
          const expanded = expandedDomains[domain.id] ?? true
          return (
            <Card key={domain.id}>
              {/* Domain header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  value={domain.name}
                  onChange={(e) => updateDomainName(domain.id, e.target.value)}
                  className="flex-1 h-8 text-sm font-medium border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
                  maxLength={200}
                />
                <Badge variant="secondary" className="text-xs shrink-0">
                  {domain.questions.length} q
                </Badge>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => moveDomain(di, "up")} disabled={di === 0}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => moveDomain(di, "down")} disabled={di === data.domains.length - 1}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => setExpandedDomains((p) => ({ ...p, [domain.id]: !expanded }))}
                  >
                    {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeDomain(domain.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {expanded && (
                <CardContent className="p-3 space-y-2">
                  {domain.questions.map((q, qi) => (
                    <div key={q.id} className="flex items-start gap-2">
                      <span className="text-xs text-muted-foreground w-5 shrink-0 mt-2.5 text-right">{qi + 1}.</span>
                      <Textarea
                        value={q.text}
                        onChange={(e) => updateQuestion(domain.id, q.id, "text", e.target.value)}
                        rows={1}
                        className="flex-1 min-h-[36px] text-sm resize-none"
                        maxLength={500}
                      />
                      <Select
                        value={q.type}
                        onValueChange={(v) => updateQuestion(domain.id, q.id, "type", v ?? "scale")}
                      >
                        <SelectTrigger className="w-24 h-9 text-xs shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scale">Scale</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                        onClick={() => removeQuestion(domain.id, q.id)}
                        disabled={domain.questions.length <= 1}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <Button
                    variant="ghost" size="sm" className="text-xs text-muted-foreground h-7"
                    onClick={() => addQuestion(domain.id)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add question
                  </Button>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Bottom save */}
      <div className="flex justify-end pt-2 pb-8">
        <Button onClick={() => onSave(data)} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Template
        </Button>
      </div>
    </div>
  )
}
