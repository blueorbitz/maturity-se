"use server"

import { getUserId } from "@/lib/auth-helpers"
import { db } from "@/lib/db"
import { llmKeys } from "@/lib/db/schema"
import { encrypt } from "@/lib/crypto"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const SaveKeySchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal("openai"),
    apiKey: z.string().min(10).max(300),
  }),
  z.object({
    provider: z.literal("bedrock"),
    awsAccessKeyId: z.string().min(10).max(200),
    awsSecretAccessKey: z.string().min(10).max(300),
    awsRegion: z.string().min(1).max(50),
  }),
])

export async function saveLlmKey(formData: unknown) {
  const userId = await getUserId()
  const parsed = SaveKeySchema.safeParse(formData)
  if (!parsed.success) throw new Error("Invalid input: " + parsed.error.message)

  const data = parsed.data
  const now = new Date()

  if (data.provider === "openai") {
    const encryptedKey = await encrypt(data.apiKey)
    const keyHint = `sk-...${data.apiKey.slice(-4)}`

    const [existing] = await db.select().from(llmKeys).where(eq(llmKeys.userId, userId))
    if (existing) {
      await db.update(llmKeys).set({
        provider: "openai",
        encryptedKey,
        keyHint,
        awsRegion: null,
        awsAccessKeyId: null,
        encryptedAwsSecretKey: null,
        updatedAt: now,
      }).where(eq(llmKeys.userId, userId))
    } else {
      await db.insert(llmKeys).values({
        id: nanoid(),
        userId,
        provider: "openai",
        encryptedKey,
        keyHint,
        createdAt: now,
        updatedAt: now,
      })
    }
  } else {
    const encryptedKey = await encrypt(data.awsSecretAccessKey)
    const keyHint = `${data.awsAccessKeyId.slice(0, 4)}...${data.awsAccessKeyId.slice(-4)}`

    const [existing] = await db.select().from(llmKeys).where(eq(llmKeys.userId, userId))
    if (existing) {
      await db.update(llmKeys).set({
        provider: "bedrock",
        encryptedKey,
        keyHint,
        awsRegion: data.awsRegion,
        awsAccessKeyId: data.awsAccessKeyId,
        encryptedAwsSecretKey: null,
        updatedAt: now,
      }).where(eq(llmKeys.userId, userId))
    } else {
      await db.insert(llmKeys).values({
        id: nanoid(),
        userId,
        provider: "bedrock",
        encryptedKey,
        keyHint,
        awsRegion: data.awsRegion,
        awsAccessKeyId: data.awsAccessKeyId,
        createdAt: now,
        updatedAt: now,
      })
    }
  }

  revalidatePath("/settings")
}

export async function getLlmKeyInfo() {
  const userId = await getUserId()
  const [key] = await db.select({
    provider: llmKeys.provider,
    keyHint: llmKeys.keyHint,
    awsRegion: llmKeys.awsRegion,
    awsAccessKeyId: llmKeys.awsAccessKeyId,
    updatedAt: llmKeys.updatedAt,
  }).from(llmKeys).where(eq(llmKeys.userId, userId))
  return key ?? null
}

export async function deleteLlmKey() {
  const userId = await getUserId()
  await db.delete(llmKeys).where(eq(llmKeys.userId, userId))
  revalidatePath("/settings")
}
