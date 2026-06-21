"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Globe, Lock, Copy } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { deleteTemplate, updateTemplateVisibility } from "@/app/actions/templates"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { Visibility } from "@/lib/db/schema"

type Template = {
  id: string
  title: string
  topic: string
  targetAudience: string
  scaleLength: number
  visibility: Visibility
  generatedByAi: boolean
  clonedFromId: string | null
  domains: Array<{ id: string; name: string; questions: unknown[] }>
  updatedAt: Date
}

interface TemplateCardProps {
  template: Template
  showActions?: boolean
  onClone?: (id: string) => void
}

export function TemplateCard({ template, showActions = false, onClone }: TemplateCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const questionCount = template.domains.reduce((sum, d) => sum + d.questions.length, 0)

  async function handleDelete() {
    if (!confirm("Delete this template? This cannot be undone.")) return
    setLoading(true)
    await deleteTemplate(template.id)
    router.refresh()
    setLoading(false)
  }

  async function handleToggleVisibility() {
    setLoading(true)
    const next: Visibility = template.visibility === "public" ? "private" : "public"
    await updateTemplateVisibility(template.id, next)
    router.refresh()
    setLoading(false)
  }

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardContent className="flex-1 p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={template.visibility === "public" ? "default" : "secondary"} className="text-xs">
              {template.visibility === "public" ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
              {template.visibility}
            </Badge>
            {template.generatedByAi && (
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">AI</Badge>
            )}
            {template.clonedFromId && (
              <Badge variant="outline" className="text-xs">Cloned</Badge>
            )}
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" disabled={loading}>
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href={`/templates/${template.id}/edit`}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleVisibility}>
                  {template.visibility === "public"
                    ? <><Lock className="h-4 w-4 mr-2" /> Make private</>
                    : <><Globe className="h-4 w-4 mr-2" /> Make public</>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {onClone && (
            <Button variant="outline" size="sm" className="h-7 text-xs shrink-0" onClick={() => onClone(template.id)}>
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Clone
            </Button>
          )}
        </div>

        <Link href={`/templates/${template.id}`}>
          <h3 className="font-semibold text-foreground hover:text-primary transition-colors leading-snug mb-1 text-balance">
            {template.title}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground">{template.topic}</p>
      </CardContent>

      <CardFooter className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>{template.domains.length} domains · {questionCount} questions</span>
        <span>{formatDistanceToNow(template.updatedAt, { addSuffix: true })}</span>
      </CardFooter>
    </Card>
  )
}
