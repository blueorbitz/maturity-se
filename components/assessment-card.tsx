"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Play, Square, Trash2, BarChart2, Link2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { deleteAssessment, updateAssessmentStatus } from "@/app/actions/assessments"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { AssessmentStatus } from "@/lib/db/schema"
import { IconButton } from "@/components/ui/icon-button"

type Assessment = {
  id: string
  title: string
  teamName: string | null
  status: AssessmentStatus
  inviteToken: string
  dueDate: Date | null
  createdAt: Date
}

export function AssessmentCard({ assessment }: { assessment: Assessment }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("Delete this assessment and all its responses?")) return
    setLoading(true)
    await deleteAssessment(assessment.id)
    router.refresh()
    setLoading(false)
  }

  async function handleStatusChange(status: AssessmentStatus) {
    setLoading(true)
    await updateAssessmentStatus(assessment.id, status)
    router.refresh()
    setLoading(false)
  }

  function copyInviteLink() {
    const url = `${window.location.origin}/respond/${assessment.inviteToken}`
    navigator.clipboard.writeText(url)
  }

  const statusColors: Record<AssessmentStatus, string> = {
    draft: "bg-muted text-muted-foreground",
    active: "bg-green-100 text-green-700",
    closed: "bg-secondary text-secondary-foreground",
  }

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Link href={`/assessments/${assessment.id}`} className="font-medium text-foreground hover:text-primary transition-colors text-sm truncate">
              {assessment.title}
            </Link>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColors[assessment.status]}`}>
              {assessment.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {assessment.teamName ?? "No team"} · Created {formatDistanceToNow(assessment.createdAt, { addSuffix: true })}
            {assessment.dueDate && ` · Due ${formatDistanceToNow(assessment.dueDate, { addSuffix: true })}`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <IconButton size="sm" variant="ghost" icon={<BarChart2 className="h-3.5 w-3.5 mr-1.5" />}>
            <Link href={`/assessments/${assessment.id}/report`} className="gap-1.5">
              Report
            </Link>
          </IconButton>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton size="sm" variant="ghost" icon={<MoreHorizontal className="h-4 w-4" />} disabled={loading} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyInviteLink}>
                <Link2 className="h-4 w-4 mr-2" /> Copy invite link
              </DropdownMenuItem>
              {assessment.status === "draft" && (
                <DropdownMenuItem onClick={() => handleStatusChange("active")}>
                  <Play className="h-4 w-4 mr-2" /> Activate
                </DropdownMenuItem>
              )}
              {assessment.status === "active" && (
                <DropdownMenuItem onClick={() => handleStatusChange("closed")}>
                  <Square className="h-4 w-4 mr-2" /> Close
                </DropdownMenuItem>
              )}
              {assessment.status === "closed" && (
                <DropdownMenuItem onClick={() => handleStatusChange("active")}>
                  <Play className="h-4 w-4 mr-2" /> Re-activate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
