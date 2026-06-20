"use server"

import { getUserId } from "@/lib/auth-helpers"
import { db } from "@/lib/db"
import { llmKeys } from "@/lib/db/schema"
import { encrypt } from "@/lib/crypto"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const SaveKeySchema = z.object({
  provider: z.enum(["openai", "bedrock"]),
  model: z.string().max(200).optional(),
  apiFormat: z.enum(["openai", "anthropic"]).optional(),
  openaiKey: z.string().max(300).optional(),
  awsAccessKeyId: z.string().max(200).optional(),
  awsSecretKey: z.string().max(300).optional(),
  awsRegion: z.string().max(50).optional(),
})

export async function saveLlmKey(
  formData: unknown
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getUserId()
    const parsed = SaveKeySchema.safeParse(formData)
    if (!parsed.success) return { success: false, error: "Invalid input." }

    const data = parsed.data
    const now = new Date()

    if (data.provider === "openai") {
      const key = data.openaiKey?.trim()
      if (!key || key.length < 10) return { success: false, error: "A valid OpenAI API key is required." }
      const encryptedKey = await encrypt(key)
      const keyHint = `sk-...${key.slice(-4)}`

      const [existing] = await db.select().from(llmKeys).where(eq(llmKeys.userId, userId))
      const model = data.model?.trim() || "gpt-4o-mini"
      const apiFormat = "openai"
      if (existing) {
        await db.update(llmKeys).set({ provider: "openai", encryptedKey, keyHint, model, apiFormat, awsRegion: null, awsAccessKeyId: null, encryptedAwsSecretKey: null, updatedAt: now }).where(eq(llmKeys.userId, userId))
      } else {
        await db.insert(llmKeys).values({ id: nanoid(), userId, provider: "openai", encryptedKey, keyHint, model, apiFormat, createdAt: now, updatedAt: now })
      }
    } else {
      const secretKey = data.awsSecretKey?.trim()
      const accessKeyId = data.awsAccessKeyId?.trim()
      const region = data.awsRegion?.trim() ?? "us-east-1"
      if (!secretKey || secretKey.length < 10) return { success: false, error: "AWS Secret Access Key is required." }
      if (!accessKeyId || accessKeyId.length < 10) return { success: false, error: "AWS Access Key ID is required." }
      const encryptedKey = await encrypt(secretKey)
      const keyHint = `${accessKeyId.slice(0, 4)}...${accessKeyId.slice(-4)}`

      const [existing] = await db.select().from(llmKeys).where(eq(llmKeys.userId, userId))
      const model = data.model?.trim() || "minimax.minimax-m2.5"
      const apiFormat = data.apiFormat ?? "openai"
      if (existing) {
        await db.update(llmKeys).set({ provider: "bedrock", encryptedKey, keyHint, model, apiFormat, awsRegion: region, awsAccessKeyId: accessKeyId, encryptedAwsSecretKey: null, updatedAt: now }).where(eq(llmKeys.userId, userId))
      } else {
        await db.insert(llmKeys).values({ id: nanoid(), userId, provider: "bedrock", encryptedKey, keyHint, model, apiFormat, awsRegion: region, awsAccessKeyId: accessKeyId, createdAt: now, updatedAt: now })
      }
    }

    revalidatePath("/settings")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to save key. Please try again." }
  }
}

export async function getLlmKeyInfo() {
  const userId = await getUserId()
  const [key] = await db.select({
    provider: llmKeys.provider,
    keyHint: llmKeys.keyHint,
    model: llmKeys.model,
    apiFormat: llmKeys.apiFormat,
    awsRegion: llmKeys.awsRegion,
    awsAccessKeyId: llmKeys.awsAccessKeyId,
    updatedAt: llmKeys.updatedAt,
  }).from(llmKeys).where(eq(llmKeys.userId, userId))
  return key ?? null
}

export async function deleteLlmKey(): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getUserId()
    await db.delete(llmKeys).where(eq(llmKeys.userId, userId))
    revalidatePath("/settings")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to remove key." }
  }
}

export async function testLlmConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getUserId()
    const [keyRecord] = await db.select().from(llmKeys).where(eq(llmKeys.userId, userId))
    
    if (!keyRecord) {
      return { success: false, message: "No LLM key configured. Save your credentials first." }
    }

    // Import here to avoid circular deps at module load
    const { callLlm } = await import("@/lib/llm")
    
    // Simple test prompt
    const testPrompt = "Reply with exactly: Connection successful"
    const response = await callLlm(
      {
        provider: keyRecord.provider as any,
        encryptedKey: keyRecord.encryptedKey,
        model: keyRecord.model ?? undefined,
        apiFormat: keyRecord.apiFormat as any,
        awsRegion: keyRecord.awsRegion ?? undefined,
        awsAccessKeyId: keyRecord.awsAccessKeyId ?? undefined,
      },
      testPrompt
    )
    
    if (!response || response.length === 0) {
      return { success: false, message: "LLM returned an empty response. Check your credentials." }
    }

    return { success: true, message: `✓ Connection successful. Response: ${response.substring(0, 50)}...` }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return { success: false, message: `Connection failed: ${errorMsg}` }
  }
}
