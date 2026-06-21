"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { generateTemplate, saveTemplate } from "@/app/actions/templates"
import { getMyCredits } from "@/app/actions/promo-codes"
import posthog from "posthog-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Sparkles, PenLine, Key, Zap, Check } from "lucide-react"
import { TemplateEditor } from "@/components/template-editor"
import type { Domain, ScaleLevel } from "@/lib/db/schema"
import { nanoid } from "nanoid"

const TOPICS = [
  "DevSecOps",
  "AI Engineering",
  "Platform Engineering",
  "Site Reliability Engineering (SRE)",
  "Delivery Excellence",
  "Architecture Maturity",
  "Cloud Native",
  "Observability",
  "Data Engineering",
  "Custom",
]

const AUDIENCE_PRESETS = [
  "Engineering Team",
  "Engineering Managers",
  "Platform Team",
  "Leadership / Directors",
  "Full Engineering Organisation",
  "Custom",
]

interface DraftTemplate {
  title: string
  topic: string
  context?: string
  targetAudience: string
  scaleLength: number
  scaleLevels: ScaleLevel[]
  domains: Domain[]
  generatedByAi: boolean
}

interface NewTemplateFormProps {
  hasLlmKey: boolean
  defaultLlmMode: 'own_key' | 'platform_credits'
  platformCreditsRemaining: number
  onCreditsChanged?: (newRemaining: number) => void
}

export function NewTemplateForm({ hasLlmKey, defaultLlmMode, platformCreditsRemaining, onCreditsChanged }: NewTemplateFormProps) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<DraftTemplate | null>(null)
  const [usePlatformCredits, setUsePlatformCredits] = useState(defaultLlmMode === 'platform_credits')

  const [title, setTitle] = useState("")
  const [topic, setTopic] = useState("")
  const [customTopic, setCustomTopic] = useState("")
  const [context, setContext] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [customAudience, setCustomAudience] = useState("")

  const SCALE_LENGTH = 5
  const effectiveTopic = topic === "Custom" ? customTopic : topic
  const effectiveAudience = targetAudience === "Custom" ? customAudience : targetAudience

  const canUseOwnKey = hasLlmKey
  const canUsePlatformCredits = platformCreditsRemaining > 0
  const canGenerate = canUseOwnKey || canUsePlatformCredits

  async function handleGenerate() {
    setError(null)
    setGenerating(true)
    try {
      const result = await generateTemplate({
        title,
        topic: effectiveTopic,
        context: context || undefined,
        targetAudience: effectiveAudience,
        scaleLength: SCALE_LENGTH,
        usePlatformCredits,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      setDraft({ ...result.data, generatedByAi: true })

      if (usePlatformCredits) {
        const credits = await getMyCredits()
        onCreditsChanged?.(credits.remaining)
      }

      posthog.capture('template_ai_generated', { prompt_length: (context || '').length })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed")
    } finally {
      setGenerating(false)
    }
  }

  function handleCreateManually() {
    const defaultScaleLevels: ScaleLevel[] = Array.from({ length: SCALE_LENGTH }, (_, i) => ({
      level: i + 1,
      label: ["Initial", "Developing", "Defined", "Managed", "Optimizing"][i] ?? `Level ${i + 1}`,
      description: `Level ${i + 1} maturity description`,
    }))
    setDraft({
      title,
      topic: effectiveTopic,
      context: context || undefined,
      targetAudience: effectiveAudience,
      scaleLength: SCALE_LENGTH,
      scaleLevels: defaultScaleLevels,
      domains: [
        {
          id: nanoid(),
          name: "Domain 1",
          questions: [
            { id: nanoid(), text: "Sample question?", type: "scale" },
          ],
        },
      ],
      generatedByAi: false,
    })
  }

  async function handleSave(updated: DraftTemplate) {
    setSaving(true)
    setError(null)
    try {
      const { id } = await saveTemplate({
        title: updated.title,
        topic: updated.topic,
        context: updated.context,
        targetAudience: updated.targetAudience,
        scaleLength: updated.scaleLength,
        scaleLevels: updated.scaleLevels,
        domains: updated.domains,
        visibility: "private",
        generatedByAi: updated.generatedByAi,
      })
      posthog.capture('template_created', { generated_by_ai: updated.generatedByAi })
      router.push(`/templates/${id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const canProceed = title.trim() && effectiveTopic.trim() && effectiveAudience.trim()

  if (draft) {
    return (
      <TemplateEditor
        initialData={draft}
        onSave={handleSave}
        onBack={() => setDraft(null)}
        saving={saving}
        error={error}
      />
    )
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Template title <span className="text-destructive">*</span></Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. DevSecOps Maturity Assessment Q3 2025"
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic">Domain / Topic <span className="text-destructive">*</span></Label>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger id="topic">
              <SelectValue placeholder="Select a domain" />
            </SelectTrigger>
            <SelectContent>
              {TOPICS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {topic === "Custom" && (
            <Input
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Enter custom topic"
              maxLength={200}
              className="mt-2"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="audience">Target audience <span className="text-destructive">*</span></Label>
          <Select value={targetAudience} onValueChange={setTargetAudience}>
            <SelectTrigger id="audience">
              <SelectValue placeholder="Select target audience" />
            </SelectTrigger>
            <SelectContent>
              {AUDIENCE_PRESETS.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {targetAudience === "Custom" && (
            <Input
              value={customAudience}
              onChange={(e) => setCustomAudience(e.target.value)}
              placeholder="e.g. Data Engineering Team, Security Champions"
              maxLength={200}
              className="mt-2"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label>Maturity scale levels</Label>
          <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-muted/40 text-sm text-muted-foreground w-32 select-none">
            5 levels
          </div>
          <p className="text-xs text-muted-foreground">Fixed at 5 tiers: Initial → Developing → Defined → Managed → Optimizing.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="context">Context / Scope <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Describe the team size, current stack, specific focus areas, or any relevant context..."
            rows={3}
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground">{context.length}/2000</p>
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
        )}

        {canGenerate && canUseOwnKey && canUsePlatformCredits && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">LLM source for this generation</Label>
            <div className="flex rounded-lg border border-input overflow-hidden">
              <Button
                size="sm"
                onClick={() => setUsePlatformCredits(false)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm transition-colors ${
                  !usePlatformCredits
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted'
                }`}
                disabled={generating}
              >
                {!usePlatformCredits ? <Check className="h-3.5 w-3.5" /> : <Key className="h-3.5 w-3.5" />}
                Use my key
              </Button>
              <Button
                size="sm"
                onClick={() => setUsePlatformCredits(true)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm transition-colors ${
                  usePlatformCredits
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted'
                }`}
                disabled={generating}
              >
                {usePlatformCredits ? <Check className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
                Use platform credits
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {canGenerate ? (
            <Button
              onClick={handleGenerate}
              disabled={!canProceed || generating}
              className="flex-1"
            >
              {generating
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                : <><Sparkles className="h-4 w-4 mr-2" /> Generate with AI</>}
            </Button>
          ) : (
            <div className="flex-1 space-y-2 text-sm text-muted-foreground bg-muted rounded-md px-3 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Add an LLM key in Settings or redeem a promo code to generate templates with AI.</span>
              </div>
              <div className="flex gap-2 pl-6">
                <a href="/settings#llm-provider" className="text-primary underline text-xs hover:text-primary/80">
                  Add LLM key
                </a>
                <span className="text-muted-foreground/50">|</span>
                <a href="/settings" className="text-primary underline text-xs hover:text-primary/80">
                  Redeem promo code
                </a>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            onClick={handleCreateManually}
            disabled={!canProceed || generating}
            className="flex-1"
          >
            <PenLine className="h-4 w-4 mr-2" /> Build manually
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
