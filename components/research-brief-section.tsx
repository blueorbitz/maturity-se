"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, FileText } from "lucide-react"

interface ResearchBriefSectionProps {
  researchBrief: string | null | undefined
  className?: string
}

export function ResearchBriefSection({ researchBrief, className = "" }: ResearchBriefSectionProps) {
  const [open, setOpen] = useState(false)

  if (!researchBrief) return null

  return (
    <div className={`rounded-md border border-border overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground bg-muted/40 hover:bg-muted transition-colors"
      >
        {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        Research Brief
        <span className="ml-auto text-xs font-normal text-muted-foreground">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="px-4 py-3 border-t border-border bg-background">
          <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
            {researchBrief}
          </pre>
        </div>
      )}
    </div>
  )
}