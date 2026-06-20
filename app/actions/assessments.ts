"use server"

import { getUserId } from "@/lib/auth-helpers"
import { db } from "@/lib/db"
import { assessments, responses, templates } from "@/lib/db/schema"
import type { AssessmentStatus } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CreateAssessmentSchema = z.object({
  templateId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  teamName: z.string().max(200).optional(),
  dueDate: z.string().optional(),
})

export async function createAssessment(formData: {
  templateId: string
  title: string
  description?: string
  teamName?: string
  dueDate?: string
}) {
  const userId = await getUserId()

  const parsed = CreateAssessmentSchema.safeParse(formData)
  if (!parsed.success) throw new Error("Invalid input: " + parsed.error.message)

  const data = parsed.data

  // Verify user owns or can access the template
  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, data.templateId))
  if (!template) throw new Error("Template not found")

  const id = nanoid()
  const inviteToken = nanoid(32)
  const now = new Date()

  await db.insert(assessments).values({
    id,
    userId,
    templateId: data.templateId,
    title: data.title,
    description: data.description,
    status: "draft",
    inviteToken,
    teamName: data.teamName,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    createdAt: now,
    updatedAt: now,
  })

  revalidatePath("/assessments")
  return { id, inviteToken }
}

export async function updateAssessmentStatus(id: string, status: AssessmentStatus) {
  const userId = await getUserId()
  await db
    .update(assessments)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(assessments.id, id), eq(assessments.userId, userId)))
  revalidatePath("/assessments")
  revalidatePath(`/assessments/${id}`)
}

export async function deleteAssessment(id: string) {
  const userId = await getUserId()
  await db.delete(assessments).where(and(eq(assessments.id, id), eq(assessments.userId, userId)))
  revalidatePath("/assessments")
}

export async function getMyAssessments() {
  const userId = await getUserId()
  return db
    .select()
    .from(assessments)
    .where(eq(assessments.userId, userId))
    .orderBy(desc(assessments.createdAt))
}

export async function getAssessmentById(id: string) {
  const userId = await getUserId()
  const [assessment] = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.id, id), eq(assessments.userId, userId)))
  return assessment ?? null
}

export async function getAssessmentByToken(token: string) {
  const [assessment] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.inviteToken, token))
  return assessment ?? null
}

export async function getAssessmentResponses(assessmentId: string) {
  const userId = await getUserId()
  // Verify ownership
  const [assessment] = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.id, assessmentId), eq(assessments.userId, userId)))
  if (!assessment) throw new Error("Assessment not found")

  return db
    .select()
    .from(responses)
    .where(eq(responses.assessmentId, assessmentId))
    .orderBy(desc(responses.submittedAt))
}

export async function submitResponse(data: {
  assessmentId: string
  respondentName?: string
  respondentRole?: string
  answers: Record<string, number>
}): Promise<{ success: boolean; error?: string }> {
  try {
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, data.assessmentId))
    if (!assessment) return { success: false, error: "Assessment not found." }
    if (assessment.status !== "active") return { success: false, error: "This assessment is not currently accepting responses." }

    const id = nanoid()
    await db.insert(responses).values({
      id,
      assessmentId: data.assessmentId,
      respondentName: data.respondentName,
      respondentRole: data.respondentRole,
      answers: data.answers,
      submittedAt: new Date(),
    })

    return { success: true }
  } catch {
    return { success: false, error: "Failed to submit response. Please try again." }
  }
}
