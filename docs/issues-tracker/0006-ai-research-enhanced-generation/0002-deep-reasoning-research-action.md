## Parent

PRD: `docs/prd/0006-ai-research-enhanced-generation.md`

## What to build

Create a new `reasonAboutTopic` server action and modify `generateTemplate` to support an optional research brief. This delivers the "Deep Reasoning" path end-to-end at the action layer.

**New action: `reasonAboutTopic`** (in a new research actions file)
- Accepts: topic, context, targetAudience, an optional web summary (string), and usePlatformCredits flag
- Uses a chain-of-thought prompt that instructs the LLM to identify relevant maturity frameworks, key assessment dimensions, and best practices for the given topic
- Returns a markdown-formatted research brief with headings like "## Relevant Frameworks", "## Key Dimensions", "## Recommended Focus Areas"
- Uses the same LLM key/credential source logic as `generateTemplate` (own key or platform credits)
- Logs one entry to `llmUsageLog` (deducts 1 platform credit when using platform credits)
- Same model as generation (user's configured model or platform model)

**Modified action: `generateTemplate`**
- Accepts a new optional `researchBrief` parameter
- When `researchBrief` is provided, uses a different prompt variant that instructs the model to ground its output in the research findings (map domains to identified frameworks, ensure questions measure specific practices mentioned)
- When `researchBrief` is absent, uses the existing prompt unchanged (zero regression)

## Acceptance criteria

- [ ] New server action `reasonAboutTopic` exists and is exported
- [ ] `reasonAboutTopic` calls the LLM and returns a markdown string
- [ ] `reasonAboutTopic` respects the `usePlatformCredits` flag (uses platform credentials or user's own key)
- [ ] `reasonAboutTopic` logs to `llmUsageLog` with feature "template_research_reasoning"
- [ ] `generateTemplate` accepts an optional `researchBrief` parameter
- [ ] When `researchBrief` is provided, `generateTemplate` uses the "with research" prompt variant
- [ ] When `researchBrief` is absent, `generateTemplate` behavior is identical to current (no regression)
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes

## Blocked by

None — can start immediately
