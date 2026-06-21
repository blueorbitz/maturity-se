"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Copy, ExternalLink } from "lucide-react"
import type { AssessmentStatus } from "@/lib/db/schema"

export function InviteLinkBox({ token, status }: { token: string; status: AssessmentStatus }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/respond/${token}`
    : `/respond/${token}`

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={url} readOnly className="text-xs font-mono text-muted-foreground" />
        <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" className="shrink-0">
          <a href={`/respond/${token}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
      {status !== "active" && (
        <p className="text-xs text-muted-foreground">
          Activate the assessment to allow respondents to submit answers.
        </p>
      )}
    </div>
  )
}
