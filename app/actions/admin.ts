"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { promoCodes, promoCodeRedemptions } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"

async function requireAdmin(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")

  const adminEmails = process.env.ADMIN_EMAILS
  if (!adminEmails) throw new Error("Admin access not configured")

  const emails = adminEmails.split(",").map((e) => e.trim().toLowerCase())
  if (!emails.includes(session.user.email.toLowerCase())) {
    throw new Error("Forbidden: not an admin")
  }

  return session.user.id
}

export async function createPromoCode(
  code: string,
  generations: number,
  expiresAt: Date
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const normalizedCode = code.trim().toUpperCase()
    if (!normalizedCode) {
      return { success: false, error: "Code is required." }
    }
    if (generations <= 0) {
      return { success: false, error: "Generations must be positive." }
    }

    // Check for duplicate code
    const [existing] = await db
      .select()
      .from(promoCodes)
      .where(eq(promoCodes.code, normalizedCode))

    if (existing) {
      return { success: false, error: "A promo code with this name already exists." }
    }

    await db.insert(promoCodes).values({
      id: nanoid(),
      code: normalizedCode,
      generations,
      enabled: true,
      expiresAt,
    })

    revalidatePath("/admin/promo-codes")
    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create promo code."
    return { success: false, error: msg }
  }
}

export async function getPromoCodes() {
  await requireAdmin()

  const codes = await db
    .select({
      id: promoCodes.id,
      code: promoCodes.code,
      generations: promoCodes.generations,
      enabled: promoCodes.enabled,
      expiresAt: promoCodes.expiresAt,
      createdAt: promoCodes.createdAt,
      redemptionCount: sql<number>`coalesce(count(${promoCodeRedemptions.id}), 0)`,
    })
    .from(promoCodes)
    .leftJoin(promoCodeRedemptions, eq(promoCodeRedemptions.promoCodeId, promoCodes.id))
    .groupBy(promoCodes.id, promoCodes.code, promoCodes.generations, promoCodes.enabled, promoCodes.expiresAt, promoCodes.createdAt)
    .orderBy(sql`${promoCodes.createdAt} desc`)

  return codes
}

export async function togglePromoCode(
  id: string
): Promise<{ success: boolean; enabled?: boolean; error?: string }> {
  try {
    await requireAdmin()

    const [existing] = await db
      .select({ enabled: promoCodes.enabled })
      .from(promoCodes)
      .where(eq(promoCodes.id, id))

    if (!existing) {
      return { success: false, error: "Promo code not found." }
    }

    const newEnabled = !existing.enabled
    await db.update(promoCodes).set({ enabled: newEnabled }).where(eq(promoCodes.id, id))
    revalidatePath("/admin/promo-codes")
    return { success: true, enabled: newEnabled }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to toggle promo code."
    return { success: false, error: msg }
  }
}

export async function deletePromoCode(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    await db.delete(promoCodes).where(eq(promoCodes.id, id))
    revalidatePath("/admin/promo-codes")
    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to delete promo code."
    return { success: false, error: msg }
  }
}
