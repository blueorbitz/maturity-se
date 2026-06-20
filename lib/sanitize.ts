/**
 * Sanitizes user-supplied text before it is included in an LLM prompt.
 * Strips HTML tags, control characters, and common prompt-injection patterns.
 */
export function sanitizeForLlm(input: string): string {
  if (typeof input !== "string") return ""

  return input
    // Remove HTML / XML tags
    .replace(/<[^>]*>/g, "")
    // Remove null bytes and other non-printable control characters (except newline/tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Collapse excessive whitespace
    .replace(/\s{3,}/g, "  ")
    // Remove common prompt-injection trigger phrases (case-insensitive)
    .replace(
      /\b(ignore (all |previous |above |prior |system )?(instructions?|prompts?|context)|forget everything|new instructions?|disregard|you are now|act as|jailbreak|DAN|roleplay as)\b/gi,
      "[removed]"
    )
    .trim()
    // Hard cap at 2000 chars per field to prevent token abuse
    .slice(0, 2000)
}

/**
 * Validates that a number is a safe integer within an inclusive range.
 */
export function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value)
  if (!Number.isInteger(n)) return fallback
  return Math.min(max, Math.max(min, n))
}
