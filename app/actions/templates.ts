"use server"

import { getUserId } from "@/lib/auth-helpers"
import { db } from "@/lib/db"
import { llmKeys, templates } from "@/lib/db/schema"
import type { Domain, ScaleLevel, Visibility } from "@/lib/db/schema"
import { callLlm } from "@/lib/llm"
import { sanitizeForLlm, clampInt } from "@/lib/sanitize"
import { and, desc, eq, or } from "drizzle-orm"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const GenerateSchema = z.object({
  title: z.string().min(1).max(200),
  topic: z.string().min(1).max(200),
  context: z.string().max(2000).optional(),
  targetAudience: z.string().min(1).max(200),
  scaleLength: z.number().int().min(2).max(10).default(5),
})

const SaveTemplateSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(200),
  topic: z.string().min(1).max(200),
  context: z.string().max(2000).optional(),
  targetAudience: z.string().min(1).max(200),
  scaleLength: z.number().int().min(2).max(10).default(5),
  scaleLevels: z.array(z.object({ level: z.number(), label: z.string(), description: z.string() })),
  domains: z.array(z.object({
    id: z.string(),
    name: z.string(),
    questions: z.array(z.object({ id: z.string(), text: z.string(), type: z.enum(["scale", "text"]) })),
  })),
  visibility: z.enum(["private", "public"]).default("private"),
  generatedByAi: z.boolean().default(false),
  clonedFromId: z.string().optional().nullable(),
})

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function generateTemplate(formData: {
  title: string
  topic: string
  context?: string
  targetAudience: string
  scaleLength: number
}) {
  const userId = await getUserId()

  const parsed = GenerateSchema.safeParse(formData)
  if (!parsed.success) throw new Error("Invalid input: " + parsed.error.message)

  const data = parsed.data
  const title = sanitizeForLlm(data.title)
  const topic = sanitizeForLlm(data.topic)
  const context = data.context ? sanitizeForLlm(data.context) : ""
  const targetAudience = sanitizeForLlm(data.targetAudience)
  const scaleLength = clampInt(data.scaleLength, 2, 10, 5)

  const [keyRecord] = await db.select().from(llmKeys).where(eq(llmKeys.userId, userId))
  if (!keyRecord) throw new Error("No LLM API key configured. Please add one in Settings.")

  const scaleExamples = Array.from({ length: scaleLength }, (_, i) => `${i + 1}`).join(", ")

  const prompt = `You are a software engineering maturity assessment expert.

Generate a comprehensive maturity assessment template with the following specification:
- Title: ${title}
- Topic/Domain: ${topic}
- Context/Scope: ${context || "General software engineering team"}
- Target Audience: ${targetAudience}
- Maturity Scale: ${scaleLength} levels (${scaleExamples})

Return a JSON object with EXACTLY this structure (no markdown, no code fences, raw JSON only):
{
  "scaleLevels": [
    { "level": 1, "label": "Initial", "description": "Brief description of level 1" },
    ... one entry per level up to ${scaleLength}
  ],
  "domains": [
    {
      "id": "unique-id",
      "name": "Domain Name",
      "questions": [
        { "id": "q-unique-id", "text": "Question text?", "type": "scale" },
        ... 4-6 questions per domain
      ]
    },
    ... 4-6 domains total, each covering a distinct aspect of ${topic}
  ]
}

Rules:
- Scale labels must be concise (1-2 words): e.g., Initial, Developing, Defined, Managed, Optimizing
- Each question must be specific and measurable
- Questions use type "scale" for maturity scoring (1-${scaleLength}) or "text" for open-ended qualitative answers
- IDs must be unique strings (use kebab-case)
- No markdown, no prose, only the JSON object`

  const raw = await callLlm(keyRecord, prompt)

  // Extract JSON from response (strip any accidental markdown fences or prose)
  // Match the outermost JSON object: find first { and last }
  const firstBrace = raw.indexOf('{')
  const lastBrace = raw.lastIndexOf('}')
  
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error("LLM returned an unexpected response format. Please try again.")
  }
  
  const jsonStr = raw.substring(firstBrace, lastBrace + 1)

  let parsed2: { scaleLevels: ScaleLevel[]; domains: Domain[] }
  try {
    parsed2 = JSON.parse(jsonStr) as {
      scaleLevels: ScaleLevel[]
      domains: Domain[]
    }
  } catch {
    throw new Error("LLM returned invalid JSON. Please try again.")
  }

  if (!Array.isArray(parsed2.scaleLevels) || !Array.isArray(parsed2.domains)) {
    throw new Error("LLM response missing required fields.")
  }

  return {
    title: data.title,
    topic: data.topic,
    context: data.context,
    targetAudience: data.targetAudience,
    scaleLength,
    scaleLevels: parsed2.scaleLevels,
    domains: parsed2.domains,
  }
}

export async function saveTemplate(formData: z.infer<typeof SaveTemplateSchema>) {
  const userId = await getUserId()

  const parsed = SaveTemplateSchema.safeParse(formData)
  if (!parsed.success) throw new Error("Invalid input: " + parsed.error.message)

  const data = parsed.data
  const now = new Date()

  if (data.id) {
    // Update existing (must own it)
    const [existing] = await db
      .select()
      .from(templates)
      .where(and(eq(templates.id, data.id), eq(templates.userId, userId)))
    if (!existing) throw new Error("Template not found")

    await db
      .update(templates)
      .set({
        title: data.title,
        topic: data.topic,
        context: data.context,
        targetAudience: data.targetAudience,
        scaleLength: data.scaleLength,
        scaleLevels: data.scaleLevels,
        domains: data.domains,
        visibility: data.visibility,
        updatedAt: now,
      })
      .where(and(eq(templates.id, data.id), eq(templates.userId, userId)))

    revalidatePath("/templates")
    revalidatePath(`/templates/${data.id}`)
    return { id: data.id }
  }

  const id = nanoid()
  await db.insert(templates).values({
    id,
    userId,
    title: data.title,
    topic: data.topic,
    context: data.context,
    targetAudience: data.targetAudience,
    scaleLength: data.scaleLength,
    scaleLevels: data.scaleLevels,
    domains: data.domains,
    visibility: data.visibility,
    generatedByAi: data.generatedByAi,
    clonedFromId: data.clonedFromId ?? null,
    createdAt: now,
    updatedAt: now,
  })

  revalidatePath("/templates")
  return { id }
}

export async function getMyTemplates() {
  const userId = await getUserId()
  return db
    .select()
    .from(templates)
    .where(eq(templates.userId, userId))
    .orderBy(desc(templates.updatedAt))
}

export async function getTemplateById(id: string) {
  const userId = await getUserId()
  const [template] = await db
    .select()
    .from(templates)
    .where(
      and(
        eq(templates.id, id),
        or(eq(templates.userId, userId), eq(templates.visibility, "public"))
      )
    )
  return template ?? null
}

export async function getPublicTemplates() {
  return db
    .select()
    .from(templates)
    .where(eq(templates.visibility, "public"))
    .orderBy(desc(templates.updatedAt))
}

export async function cloneTemplate(sourceId: string) {
  const userId = await getUserId()

  const [source] = await db
    .select()
    .from(templates)
    .where(and(eq(templates.id, sourceId), eq(templates.visibility, "public")))
  if (!source) throw new Error("Template not found or not public")

  const id = nanoid()
  const now = new Date()

  await db.insert(templates).values({
    id,
    userId,
    title: `${source.title} (copy)`,
    topic: source.topic,
    context: source.context,
    targetAudience: source.targetAudience,
    scaleLength: source.scaleLength,
    scaleLevels: source.scaleLevels,
    domains: source.domains,
    visibility: "private",
    generatedByAi: source.generatedByAi,
    clonedFromId: sourceId,
    createdAt: now,
    updatedAt: now,
  })

  revalidatePath("/templates")
  return { id }
}

export async function updateTemplateVisibility(id: string, visibility: Visibility) {
  const userId = await getUserId()
  await db
    .update(templates)
    .set({ visibility, updatedAt: new Date() })
    .where(and(eq(templates.id, id), eq(templates.userId, userId)))
  revalidatePath("/templates")
  revalidatePath("/gallery")
}

export async function deleteTemplate(id: string) {
  const userId = await getUserId()
  await db.delete(templates).where(and(eq(templates.id, id), eq(templates.userId, userId)))
  revalidatePath("/templates")
}
