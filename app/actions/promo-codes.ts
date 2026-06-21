"use server"

import { getUserId } from "@/lib/auth-helpers"
import { db } from "@/lib/db"
import { promoCodes, promoCodeRedemptions, llmUsageLog } from "@/lib/db/schema"
import { and, eq, sql } from "drizzle-orm"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"

export async function redeemPromoCode(
  code: string
): Promise<{ success: boolean; generationsGranted?: number; remaining?: number; error?: string }> {
  try {
    const userId = await getUserId()
    const normalizedCode = code.trim().toUpperCase()

    if (!normalizedCode) {
      return { success: false, error: "Please enter a promo code." }
    }

    // Find the promo code
    const [promoCode] = await db
      .select()
      .from(promoCodes)
      .where(eq(promoCodes.code, normalizedCode))

    if (!promoCode) {
      return { success: false, error: "Invalid promo code." }
    }

    // Check expiry
    if (new Date() > promoCode.expiresAt) {
      return { success: false, error: "This promo code has expired." }
    }

    // Check if already redeemed by this user
    const [existingRedemption] = await db
      .select()
      .from(promoCodeRedemptions)
      .where(
        and(
          eq(promoCodeRedemptions.userId, userId),
          eq(promoCodeRedemptions.promoCodeId, promoCode.id)
        )
      )

    if (existingRedemption) {
      return { success: false, error: "You have already redeemed this code." }
    }

    // Create redemption
    await db.insert(promoCodeRedemptions).values({
      id: nanoid(),
      userId,
      promoCodeId: promoCode.id,
    })

    revalidatePath("/settings")

    // Calculate remaining
    const credits = await getMyCredits()

    return {
      success: true,
      generationsGranted: promoCode.generations,
      remaining: credits.remaining,
    }
  } catch {
    return { success: false, error: "Failed to redeem code. Please try again." }
  }
}

export async function getMyCredits(): Promise<{
  totalGranted: number
  used: number
  remaining: number
}> {
  const userId = await getUserId()

  // Sum all generations granted from redemptions
  const [grantedResult] = await db
    .select({
      total: sql<number>`coalesce(sum(${promoCodes.generations}), 0)`,
    })
    .from(promoCodeRedemptions)
    .innerJoin(promoCodes, eq(promoCodeRedemptions.promoCodeId, promoCodes.id))
    .where(eq(promoCodeRedemptions.userId, userId))

  const totalGranted = Number(grantedResult?.total ?? 0)

  // Count platform LLM usages
  const [usedResult] = await db
    .select({
      total: sql<number>`coalesce(count(*), 0)`,
    })
    .from(llmUsageLog)
    .where(
      and(
        eq(llmUsageLog.userId, userId),
        eq(llmUsageLog.provider, "platform")
      )
    )

  const used = Number(usedResult?.total ?? 0)

  return {
    totalGranted,
    used,
    remaining: totalGranted - used,
  }
}
