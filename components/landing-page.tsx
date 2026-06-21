import Link from 'next/link'
import {
  ArrowRight,
  Sparkles,
  Users,
  ChartColumn,
  Globe,
  CircleCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IconButton } from "@/components/ui/icon-button"

const topics = [
  { label: 'DevSecOps', bg: 'bg-blue-100', text: 'text-blue-800' },
  { label: 'AI Maturity', bg: 'bg-purple-100', text: 'text-purple-800' },
  { label: 'Platform Eng.', bg: 'bg-green-100', text: 'text-green-800' },
  { label: 'SRE / Reliability', bg: 'bg-orange-100', text: 'text-orange-800' },
  { label: 'Developer Experience', bg: 'bg-pink-100', text: 'text-pink-800' },
  { label: 'Cloud Native', bg: 'bg-cyan-100', text: 'text-cyan-800' },
  { label: '+ any topic...', bg: 'bg-muted', text: 'text-muted-foreground' },
]

const features = [
  {
    icon: Sparkles,
    title: 'AI-Generated Templates',
    description:
      'Describe any engineering topic and AI instantly builds a structured questionnaire with tiers, sections, and industry-aligned questions.',
  },
  {
    icon: Users,
    title: 'Send to Your Team',
    description:
      'Share a unique link with your team. No accounts needed to respond — just open the link and answer.',
  },
  {
    icon: ChartColumn,
    title: 'Maturity Reports',
    description:
      'Get an aggregated view of team maturity scores, tier distribution, and per-respondent breakdowns.',
  },
  {
    icon: Globe,
    title: 'Global Template Gallery',
    description:
      'Browse and fork community-built templates. Publish your own to help other engineering leaders.',
  },
]

const tiers = [
  {
    level: 1,
    name: 'Initial',
    description: 'Ad-hoc, reactive',
    range: '0–20%',
    color: '#ef4444',
  },
  {
    level: 2,
    name: 'Developing',
    description: 'Some processes defined',
    range: '21–40%',
    color: '#f97316',
  },
  {
    level: 3,
    name: 'Defined',
    description: 'Documented & repeatable',
    range: '41–60%',
    color: '#eab308',
  },
  {
    level: 4,
    name: 'Managed',
    description: 'Measured & monitored',
    range: '61–80%',
    color: '#3b82f6',
  },
  {
    level: 5,
    name: 'Optimizing',
    description: 'Continuously improving',
    range: '81–100%',
    color: '#22c55e',
  },
]

const steps = [
  {
    number: '01',
    title: 'Create a template',
    description:
      'Type a topic (e.g. "DevSecOps maturity") and let AI generate a full questionnaire with tiers, sections, and questions. Edit to perfection.',
  },
  {
    number: '02',
    title: 'Send to your team',
    description:
      'Launch an assessment and share the unique link with your engineers. They fill it in — no login required.',
  },
  {
    number: '03',
    title: 'Review the report',
    description:
      'See aggregated maturity scores, tier distribution, and individual responses. Use insights to drive your engineering roadmap.',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded bg-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-3 text-primary-foreground"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M9 12l2 2 4-4" />
                <path d="M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-foreground">MaturitySE</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Button size="sm">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs">
            For Engineering Managers & Directors
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance mb-6">
            Measure your team&apos;s engineering maturity
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty leading-relaxed">
            Create AI-powered maturity questionnaires for any software engineering domain.
            Send to your team, collect responses, and generate actionable reports.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            
            <IconButton
              size="lg"
              className="w-full sm:w-auto gap-2"
              icon={<ArrowRight className="size-4 h-4 w-4" />}
            >
              <Link href="/sign-up" className="gap-1.5">
                Start for free
              </Link>
            </IconButton>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/gallery">Browse templates</Link>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap gap-2 justify-center">
            {topics.map((topic) => (
              <span
                key={topic.label}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${topic.bg} ${topic.text}`}
              >
                {topic.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Everything you need to run maturity assessments
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From AI template generation to team reporting — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5-Tier Maturity Model */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/40 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              5-tier maturity model
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Assessments are classified into different domains, each answered with one of 5 maturity tiers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {tiers.map((tier) => (
              <div
                key={tier.level}
                className="flex-1 rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: tier.color }}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    Level {tier.level}
                  </span>
                </div>
                <p className="font-semibold text-sm mb-1">{tier.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{tier.description}</p>
                <p className="text-xs font-mono text-muted-foreground">{tier.range}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col gap-3">
                <span className="text-3xl font-bold text-primary/30">{step.number}</span>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border bg-zinc-300 dark:bg-zinc-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">
            Ready to assess your team?
          </h2>
          <p className="text-primary-foreground/80 mb-8 leading-relaxed">
            Create your first maturity questionnaire in minutes. Free to get started.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/sign-up">Create free account</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto bg-primary-foreground/10 text-primary-foreground"
            >
              <Link href="/gallery">View gallery</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-primary-foreground/70">
            <span className="flex items-center gap-1.5">
              <CircleCheck className="size-3.5" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CircleCheck className="size-3.5" />
              Unlimited assessments
            </span>
            <span className="flex items-center gap-1.5">
              <CircleCheck className="size-3.5" />
              Share with any team
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded bg-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-3 text-primary-foreground"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M9 12l2 2 4-4" />
                <path d="M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <span className="font-medium text-foreground">MaturitySE</span>
          </div>
          <p>Built for engineering managers & directors.</p>
        </div>
      </footer>
    </div>
  )
}
