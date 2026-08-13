"use server"

import { getUserId } from "@/lib/auth-helpers"
import { db } from "@/lib/db"
import { llmKeys, llmUsageLog } from "@/lib/db/schema"
import { callLlm, callLlmWithPlatformCredentials, getPlatformLlmModel } from "@/lib/llm"
import type { LlmKeyRecord } from "@/lib/llm"
import { sanitizeForLlm, stripReasoningTags } from "@/lib/sanitize"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { tavily } from "@tavily/core"
import { getMyCredits } from "./promo-codes"

// ─── Tavily client ───────────────────────────────────────────────────────────

function getTavilyClient() {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not configured. Web research is unavailable.")
  }
  return tavily({ apiKey })
}

// ─── Web research actions ────────────────────────────────────────────────────

export type SearchResult = { title: string; url: string; snippet: string; content: string }

/**
 * Searches the web using Tavily and returns results with extracted content.
 * Tavily returns pre-extracted page content so no separate fetch step is needed.
 */
export async function searchWeb(topic: string): Promise<SearchResult[]> {
  const client = getTavilyClient()

  const response = await client.search(sanitizeForLlm(topic), {
    searchDepth: "advanced",
    maxResults: 5,
    chunksPerSource: 3,
  })

  const results = response.results ?? []
  if (results.length === 0) {
    console.warn('[searchWeb] Tavily returned 0 results for topic:', topic)
  }

  return results.map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.content.slice(0, 200),
    content: r.content,
  }))
}

/**
 * @deprecated — Tavily returns content directly from search. Kept for API compatibility.
 */
export async function fetchPages(urls: string[]): Promise<string[]> {
  // With Tavily, content is already extracted during search.
  // This is now a no-op passthrough; callers pass content directly.
  return urls
}

export async function summarizePages(
  contents: string[],
  topic: string,
  usePlatformCredits: boolean
): Promise<string> {
  const userId = await getUserId()
  const { provider, model, call } = await resolveLlm(usePlatformCredits)

  const combined = contents.join("\n\n---\n\n").slice(0, 16000)

  const prompt = `You are a research analyst helping build a maturity assessment template.

Summarize the following web page contents, filtered strictly for relevance to the topic "${sanitizeForLlm(topic)}". Focus on:
- Recognized maturity models, frameworks, standards, or certifications mentioned
- Key capability areas/dimensions that get assessed
- Concrete best practices and measurable indicators

Target roughly 4000 characters. Skip boilerplate, navigation text, or content unrelated to the topic. Return the summary as plain text (no markdown headings, no code fences).

Content:
${combined}`

  const raw = await call(prompt)
  await logUsage(userId, "template_research_summarize", provider, model)
  return stripReasoningTags(raw).slice(0, 8000)
}

// ─── Deep reasoning action ───────────────────────────────────────────────────

export async function reasonAboutTopic(args: {
  topic: string
  context?: string
  targetAudience: string
  summary?: string
  usePlatformCredits: boolean
}): Promise<string> {
  const userId = await getUserId()
  const { provider, model, call } = await resolveLlm(args.usePlatformCredits)

  const topic = sanitizeForLlm(args.topic)
  const context = args.context ? sanitizeForLlm(args.context) : ""
  const targetAudience = sanitizeForLlm(args.targetAudience)
  const summary = args.summary ? args.summary.trim().slice(0, 12000) : ""

  const prompt = `You are an expert in software engineering maturity assessment and proven industry frameworks (e.g., CMMI, DORA, SAMM, COBIT, SPICE, NIST CSF, ISO standards).

Topic: ${topic}
Context/Scope: ${context || "General software engineering team"}
Target audience: ${targetAudience}
${summary ? `\nWeb research findings from live sources:\n${summary}` : ""}

Reason step by step about which established maturity frameworks, standards, and best-practice programs are most relevant to this topic and how they map onto an assessment.

Then produce a research brief in Markdown with EXACTLY these three sections:

## Relevant Frameworks
List 3-5 named frameworks/standards/models relevant to ${topic}, each with a one-line rationale for why it applies.

## Key Dimensions
List 6-10 distinct assessment dimensions that a maturity questionnaire on ${topic} should cover, each tied to a framework from above.

## Recommended Focus Areas
List 4-6 concrete practices, capabilities, or focus areas the questionnaire should measure, each with a brief why-it-matters.

Use bullet lists only. Do not include any text outside these three sections.`

  const raw = await call(prompt)
  await logUsage(userId, "template_research_reasoning", provider, model)
  return stripReasoningTags(raw).slice(0, 12000)
}

// ─── Shared LLM resolution helpers ───────────────────────────────────────────

type ResolvedLlm = {
  provider: string
  model: string | null
  call: (prompt: string) => Promise<string>
}

async function resolveLlm(usePlatformCredits: boolean): Promise<ResolvedLlm> {
  const userId = await getUserId()

  if (usePlatformCredits) {
    const credits = await getMyCredits()
    if (credits.remaining <= 0) {
      throw new Error("No platform credits remaining. Please add an LLM key in Settings or redeem a promo code.")
    }
    return {
      provider: "platform",
      model: getPlatformLlmModel(),
      call: (prompt) => callLlmWithPlatformCredentials(prompt),
    }
  }

  const [keyRecord] = await db
    .select()
    .from(llmKeys)
    .where(eq(llmKeys.userId, userId))

  if (!keyRecord) throw new Error("No LLM API key configured. Please add one in Settings.")

  return {
    provider: keyRecord.provider,
    model: keyRecord.model,
    call: (prompt) => callLlm(keyRecord as LlmKeyRecord, prompt),
  }
}

async function logUsage(userId: string, feature: string, provider: string, model: string | null): Promise<void> {
  await db.insert(llmUsageLog).values({
    id: nanoid(),
    userId,
    feature,
    provider,
    model,
  })
}
