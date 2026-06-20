'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/page-header'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

type DomainScore = {
  name: string
  avg: number
  questions: { questionId: string; questionText: string; avg: number; count: number }[]
}

type ScoreDistItem = { level: number; label: string; count: number }
type RespondentAvg = { name: string; role: string; avg: number; submittedAt: string }

interface MaturityReportProps {
  assessment: {
    id: string
    title: string
    description: string | null
    teamName: string | null
    status: string
    dueDate: string | null
  }
  template: {
    title: string
    topic: string
    scaleLength: number
    scaleLevels: { level: number; label: string; description: string }[]
  }
  domainScores: DomainScore[]
  scoreDistribution: ScoreDistItem[]
  respondentAverages: RespondentAvg[]
  totalResponses: number
}

const CHART_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

function levelColor(avg: number, max: number) {
  const pct = avg / max
  if (pct >= 0.8) return 'text-emerald-600 dark:text-emerald-400'
  if (pct >= 0.6) return 'text-blue-600 dark:text-blue-400'
  if (pct >= 0.4) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function MaturityGauge({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? value / max : 0
  const color = pct >= 0.8 ? '#10b981' : pct >= 0.6 ? '#6366f1' : pct >= 0.4 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 70" className="w-32 h-20">
        <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" className="text-muted/30" />
        <path
          d="M 10 65 A 50 50 0 0 1 110 65"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${pct * 157} 157`}
        />
      </svg>
      <p className="text-3xl font-bold -mt-4 tabular-nums" style={{ color }}>{value.toFixed(1)}</p>
      <p className="text-xs text-muted-foreground">out of {max}</p>
    </div>
  )
}

export function MaturityReport({
  assessment,
  template,
  domainScores,
  scoreDistribution,
  respondentAverages,
  totalResponses,
}: MaturityReportProps) {
  const [selectedDomain, setSelectedDomain] = useState<DomainScore | null>(null)

  const overallAvg =
    domainScores.length > 0
      ? parseFloat((domainScores.reduce((s, d) => s + d.avg, 0) / domainScores.length).toFixed(2))
      : 0

  const radarData = domainScores.map((d) => ({
    domain: d.name.length > 14 ? d.name.substring(0, 12) + '…' : d.name,
    fullName: d.name,
    score: d.avg,
    fullMark: template.scaleLength,
  }))

  const barData = domainScores.map((d) => ({
    name: d.name.length > 14 ? d.name.substring(0, 12) + '…' : d.name,
    score: d.avg,
    fullMark: template.scaleLength,
  }))

  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b border-border/60 bg-card">
        <div className="max-w-6xl mx-auto px-6">
          <PageHeader
            title={assessment.title}
            description={`${totalResponses} response${totalResponses !== 1 ? 's' : ''} · ${template.topic}`}
            actions={
              <Badge variant={assessment.status === 'open' ? 'default' : 'secondary'} className="capitalize">
                {assessment.status}
              </Badge>
            }
          />
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full space-y-8">
        {totalResponses === 0 ? (
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground">No responses yet. Share the invite link to start collecting data.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-border/60 col-span-2 md:col-span-1">
                <CardContent className="pt-5 flex flex-col items-center">
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Overall Maturity</p>
                  <MaturityGauge value={overallAvg} max={template.scaleLength} />
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="pt-5">
                  <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Responses</p>
                  <p className="text-3xl font-bold text-foreground">{totalResponses}</p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="pt-5">
                  <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Domains</p>
                  <p className="text-3xl font-bold text-foreground">{domainScores.length}</p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="pt-5">
                  <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Top Domain</p>
                  {domainScores.length > 0 ? (
                    <>
                      <p className="text-lg font-bold text-foreground truncate">
                        {domainScores.sort((a, b) => b.avg - a.avg)[0].name}
                      </p>
                      <p className={`text-sm font-semibold ${levelColor(domainScores[0].avg, template.scaleLength)}`}>
                        {domainScores[0].avg.toFixed(1)} / {template.scaleLength}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">—</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="radar">
              <TabsList>
                <TabsTrigger value="radar">Radar</TabsTrigger>
                <TabsTrigger value="bar">By Domain</TabsTrigger>
                <TabsTrigger value="distribution">Score Distribution</TabsTrigger>
                <TabsTrigger value="respondents">Respondents</TabsTrigger>
              </TabsList>

              {/* Radar */}
              <TabsContent value="radar" className="mt-4">
                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base">Domain Maturity Radar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={360}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                        <Radar
                          name="Maturity"
                          dataKey="score"
                          stroke="var(--primary)"
                          fill="var(--primary)"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            const d = payload[0].payload
                            return (
                              <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm shadow-md">
                                <p className="font-medium text-foreground">{d.fullName}</p>
                                <p className="text-muted-foreground">{d.score} / {template.scaleLength}</p>
                              </div>
                            )
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bar */}
              <TabsContent value="bar" className="mt-4">
                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base">Maturity by Domain</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                        <YAxis domain={[0, template.scaleLength]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            return (
                              <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm shadow-md">
                                <p className="font-medium text-foreground">{payload[0].payload.name}</p>
                                <p className="text-muted-foreground">{payload[0].value} / {template.scaleLength}</p>
                              </div>
                            )
                          }}
                        />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                          {barData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Domain drill-down */}
                    <div className="mt-6 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Domain breakdown</p>
                      {domainScores.map((d) => (
                        <button
                          key={d.name}
                          onClick={() => setSelectedDomain(selectedDomain?.name === d.name ? null : d)}
                          className="w-full text-left"
                        >
                          <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-accent/30 transition-colors">
                            <span className="text-sm font-medium text-foreground w-40 truncate">{d.name}</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${(d.avg / template.scaleLength) * 100}%` }}
                              />
                            </div>
                            <span className={`text-sm font-semibold w-16 text-right tabular-nums ${levelColor(d.avg, template.scaleLength)}`}>
                              {d.avg.toFixed(1)} / {template.scaleLength}
                            </span>
                          </div>
                          {selectedDomain?.name === d.name && (
                            <div className="ml-3 mt-1 mb-2 space-y-1 border-l-2 border-primary/30 pl-4">
                              {d.questions.map((q) => (
                                <div key={q.questionId} className="flex items-start gap-2 py-1">
                                  <span className="text-xs text-muted-foreground flex-1 leading-relaxed">{q.questionText}</span>
                                  <span className={`text-xs font-semibold shrink-0 ${levelColor(q.avg, template.scaleLength)}`}>
                                    {q.count > 0 ? q.avg.toFixed(1) : '—'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Distribution */}
              <TabsContent value="distribution" className="mt-4">
                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base">Score Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={scoreDistribution} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            return (
                              <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm shadow-md">
                                <p className="font-medium text-foreground">{payload[0].payload.label}</p>
                                <p className="text-muted-foreground">{payload[0].value} answers</p>
                              </div>
                            )
                          }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {scoreDistribution.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Respondents */}
              <TabsContent value="respondents" className="mt-4">
                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base">Individual Responses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y divide-border/60">
                      {respondentAverages.map((r, i) => (
                        <div key={i} className="flex items-center gap-4 py-3">
                          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-accent-foreground shrink-0">
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{r.name}</p>
                            {r.role && <p className="text-xs text-muted-foreground">{r.role}</p>}
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold tabular-nums ${levelColor(r.avg, template.scaleLength)}`}>
                              {r.avg.toFixed(1)} / {template.scaleLength}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(r.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
