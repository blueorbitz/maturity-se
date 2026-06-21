"use server"

import { getUserId } from "@/lib/auth-helpers"
import { db } from "@/lib/db"
import { llmUsageLog } from "@/lib/db/schema"
import { and, desc, eq, gte, sql } from "drizzle-orm"

export type UsageLog = {
  id: string
  feature: string
  provider: string
  model: string | null
  createdAt: Date
}

export async function getMyUsageLogs({
  offset = 0,
  limit = 20,
  dateRange = "all",
}: {
  offset?: number
  limit?: number
  dateRange?: "7d" | "30d" | "all"
} = {}): Promise<UsageLog[]> {
  const userId = await getUserId()

  let dateFilter = undefined
  if (dateRange === "7d") {
    dateFilter = gte(llmUsageLog.createdAt, sql`now() - interval '7 days'`)
  } else if (dateRange === "30d") {
    dateFilter = gte(llmUsageLog.createdAt, sql`now() - interval '30 days'`)
  }

  const where = dateFilter
    ? and(eq(llmUsageLog.userId, userId), dateFilter)
    : eq(llmUsageLog.userId, userId)

  const rows = await db
    .select({
      id: llmUsageLog.id,
      feature: llmUsageLog.feature,
      provider: llmUsageLog.provider,
      model: llmUsageLog.model,
      createdAt: llmUsageLog.createdAt,
    })
    .from(llmUsageLog)
    .where(where)
    .orderBy(desc(llmUsageLog.createdAt))
    .offset(offset)
    .limit(limit)

  return rows
}
