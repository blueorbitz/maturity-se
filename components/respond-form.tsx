'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { submitResponse } from '@/app/actions/assessments'
import posthog from 'posthog-js'

type ScaleLevel = { level: number; label: string; description: string }
type Question = { id: string; text: string; weight: number }
type Domain = { name: string; questions: Question[] }

interface RespondFormProps {
  assessment: {
    id: string
    title: string
    description: string | null
    teamName: string | null
    dueDate: string | null
  }
  template: {
    title: string
    topic: string
    targetAudience: string
    scaleLength: number
    scaleLevels: ScaleLevel[]
    domains: Domain[]
  }
}

export function RespondForm({ assessment, template }: RespondFormProps) {
  const [step, setStep] = useState<'intro' | 'survey' | 'done'>('intro')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [activeDomain, setActiveDomain] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const allQuestions = template.domains.flatMap((d) => d.questions)
  const answeredCount = Object.keys(answers).length
  const progress = allQuestions.length > 0 ? Math.round((answeredCount / allQuestions.length) * 100) : 0

  const currentDomain = template.domains[activeDomain]
  const domainAnswered = currentDomain?.questions.every((q) => answers[q.id] !== undefined)

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    const result = await submitResponse({
      assessmentId: assessment.id,
      respondentName: name.trim() || undefined,
      respondentRole: role.trim() || undefined,
      answers,
    })
    if (result.error) {
      setError(result.error)
      setSubmitting(false)
    } else {
      posthog.capture('response_submitted', { template_id: assessment.id })
      setStep('done')
    }
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Response submitted</h1>
          <p className="text-muted-foreground">
            Thank you for completing the <span className="font-medium text-foreground">{assessment.title}</span> assessment.
            Your responses have been recorded.
          </p>
        </div>
      </div>
    )
  }

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Maturity Assessment
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">{assessment.title}</h1>
            {assessment.description && (
              <p className="text-muted-foreground leading-relaxed">{assessment.description}</p>
            )}
          </div>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Before you start</CardTitle>
              <CardDescription>These fields are optional but help contextualize your responses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="resp-name" className="text-sm">Your name <span className="text-muted-foreground">(optional)</span></Label>
                  <Input id="resp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="resp-role" className="text-sm">Your role <span className="text-muted-foreground">(optional)</span></Label>
                  <Input id="resp-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Engineer" />
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Domains</span>
                  <span className="font-medium text-foreground">{template.domains.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total questions</span>
                  <span className="font-medium text-foreground">{allQuestions.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Maturity scale</span>
                  <span className="font-medium text-foreground">1–{template.scaleLength}</span>
                </div>
              </div>

              <Button onClick={() => setStep('survey')} className="w-full mt-2">
                Start assessment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border/60">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{assessment.title}</p>
            <Progress value={progress} className="h-1.5 mt-1.5" />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{answeredCount}/{allQuestions.length} answered</span>
        </div>
        {/* Domain tabs */}
        <div className="max-w-3xl mx-auto px-4 pb-2 flex gap-1.5 overflow-x-auto">
          {template.domains.map((d, i) => {
            const domDone = d.questions.every((q) => answers[q.id] !== undefined)
            return (
              <button
                key={i}
                onClick={() => setActiveDomain(i)}
                className={`shrink-0 text-xs px-3 py-1 rounded-full border transition-colors ${
                  i === activeDomain
                    ? 'bg-primary text-primary-foreground border-primary'
                    : domDone
                    ? 'bg-accent text-accent-foreground border-transparent'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                }`}
              >
                {d.name}
                {domDone && i !== activeDomain && (
                  <span className="ml-1 text-primary">✓</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{currentDomain?.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{currentDomain?.questions.length} questions</p>
        </div>

        {currentDomain?.questions.map((q, qi) => (
          <Card key={q.id} className={`border-border/60 transition-colors ${answers[q.id] !== undefined ? 'border-primary/30 bg-accent/20' : ''}`}>
            <CardContent className="pt-5 pb-4">
              <p className="text-sm font-medium text-foreground mb-4">
                <span className="text-muted-foreground mr-2">{qi + 1}.</span>{q.text}
              </p>
              <div className="grid gap-2">
                {Array.from({ length: template.scaleLength }, (_, i) => i + 1).map((level) => {
                  const lv = template.scaleLevels.find((l) => l.level === level)
                  const selected = answers[q.id] === level
                  return (
                    <button
                      key={level}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: level }))}
                      className={`flex items-start gap-3 text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                        selected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:border-primary/50 hover:bg-accent/30'
                      }`}
                    >
                      <span className={`shrink-0 font-bold w-5 ${selected ? 'text-primary-foreground' : 'text-primary'}`}>{level}</span>
                      <span>
                        <span className="font-medium">{lv?.label ?? `Level ${level}`}</span>
                        {lv?.description && (
                          <span className={`block text-xs mt-0.5 ${selected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{lv.description}</span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            disabled={activeDomain === 0}
            onClick={() => setActiveDomain((p) => p - 1)}
          >
            Previous
          </Button>

          {activeDomain < template.domains.length - 1 ? (
            <Button disabled={!domainAnswered} onClick={() => setActiveDomain((p) => p + 1)}>
              Next domain
            </Button>
          ) : (
            <Button
              disabled={answeredCount < allQuestions.length || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Submitting...' : 'Submit assessment'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
