"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { updateAssessmentStatus, deleteAssessment } from "@/app/actions/assessments"
import type { AssessmentStatus } from "@/lib/db/schema"
import { PlayCircle, StopCircle, Trash2, AlertTriangle } from "lucide-react"

interface AssessmentStatusControlProps {
  assessmentId: string
  currentStatus: AssessmentStatus
}

export function AssessmentStatusControl({
  assessmentId,
  currentStatus,
}: AssessmentStatusControlProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleStatus(status: AssessmentStatus) {
    setBusy(true)
    await updateAssessmentStatus(assessmentId, status)
    setBusy(false)
    router.refresh()
  }

  async function handleDelete() {
    setBusy(true)
    await deleteAssessment(assessmentId)
    router.push("/assessments")
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Status Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentStatus === "draft" && (
          <Button
            className="w-full"
            onClick={() => handleStatus("active")}
            disabled={busy}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Activate Assessment
          </Button>
        )}
        {currentStatus === "active" && (
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => handleStatus("closed")}
            disabled={busy}
          >
            <StopCircle className="h-4 w-4 mr-2" />
            Close Assessment
          </Button>
        )}
        {currentStatus === "closed" && (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => handleStatus("active")}
            disabled={busy}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Reopen Assessment
          </Button>
        )}

        <div className="pt-2 border-t border-border/60">
          {!confirmDelete ? (
            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Assessment
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-2 rounded-md">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                This will permanently delete the assessment and all responses.
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirmDelete(false)} disabled={busy}>
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" className="flex-1" onClick={handleDelete} disabled={busy}>
                  {busy ? "Deleting…" : "Confirm"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
