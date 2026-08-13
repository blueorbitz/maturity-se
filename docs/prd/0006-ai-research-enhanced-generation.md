# 0006 — AI Research-Enhanced Template Generation

## Problem Statement

The current AI template generation produces questionnaires from a single-shot LLM call with no research or reasoning. The resulting templates are generic and lack grounding in established industry frameworks, standards, or best practices relevant to the creator's specific topic. Creators want questionnaires that are more intentional — aligned with their goals and informed by real-world maturity models (CMMI, DORA, SAMM, etc.) — without having to manually research and feed that context in themselves.

## Solution

Add a research/reasoning phase before template generation. Creators can opt in via two independent checkboxes — **Web Research** and **Deep Reasoning** — which run before the existing generation step. Web Research searches DuckDuckGo, fetches top pages, and summarizes them. Deep Reasoning uses a chain-of-thought LLM call to identify relevant frameworks and practices. The output is a markdown "research brief" that feeds into an enhanced generation prompt, producing higher-quality, framework-grounded questionnaires. The research brief is shown in a collapsible non-blocking section during creation and persisted on the template for later reference.

## User Stories

1. As a template creator, I want the AI to research relevant industry frameworks before generating questions, so that my assessment is grounded in established standards rather than generic AI output.
2. As a template creator, I want to enable web search during generation, so that the AI can find current best practices and frameworks I may not be aware of.
3. As a template creator, I want to enable deep reasoning during generation, so that the AI systematically identifies relevant dimensions and practices from its training knowledge.
4. As a template creator, I want to enable both web search and deep reasoning together, so that I get the highest quality output combining real-time web findings with structured AI analysis.
5. As a template creator, I want to see which research informed my generated template, so that I can trust and understand why certain questions were included.
6. As a template creator, I want the research brief displayed in a collapsible section during generation, so that I can inspect it without it blocking my workflow.
7. As a template creator, I want to see step-by-step progress during the research pipeline, so that I know the system is working and which phase it's in during the longer generation process.
8. As a template creator, I want research failures to be handled gracefully, so that I still get a generated template even if web search is temporarily unavailable.
9. As a template creator, I want the credit cost to be transparent before I generate, so that I know enabling research costs extra credits (2 or 3 depending on options selected).
10. As a template creator, I want to revisit the research brief after template creation, so that I can recall why certain domains and questions were chosen.
11. As a template creator using platform credits, I want the research phase to use the same credit source as generation, so that billing is predictable and unified.
12. As a template creator using my own API key, I want the research phase to use my own key, so that I don't incur unexpected platform charges.
13. As a template creator, I want the research checkboxes to be independent of each other, so that I can choose the combination that fits my needs and budget.
14. As a template creator, I want generation to still work without any research enabled, so that the existing fast single-shot flow remains available.
15. As a template viewer, I want to see the research brief on the template detail page when one exists, so that I can understand the rationale behind an AI-generated template.

## Implementation Decisions

### Architecture

- Research runs as a **separate phase before generation**, not during it. No agentic loop.
- Each step is a **separate server action** called sequentially from the client. This enables per-step progress UI and keeps each action within Vercel Hobby's 10-second function timeout.
- All processing is server-side. No client-side scraping or fetching.

### Pipeline

The client orchestrates these server actions sequentially based on which checkboxes are enabled:

| Checkboxes enabled | Pipeline | LLM calls | Credits |
|---|---|---|---|
| None | `generateTemplate` | 1 | 1 |
| Web Research only | `searchWeb` → `fetchPages` → `summarizePages` → `generateTemplate` | 2 | 2 |
| Deep Reasoning only | `reasonAboutTopic` → `generateTemplate` | 2 | 2 |
| Both | `searchWeb` → `fetchPages` → `summarizePages` → `reasonAboutTopic` → `generateTemplate` | 3 | 3 |

### New server actions (in a new `research.ts` actions file)

- **`searchWeb(topic)`** — Uses `duck-duck-scrape` to query DuckDuckGo. Returns top 5 results (title, URL, snippet). No LLM call. Estimated 2–4s.
- **`fetchPages(urls)`** — Fetches top 3 URLs with a 2.5-second timeout per page. Uses `@mozilla/readability` + `linkedom` for content extraction. Returns extracted text per page. No LLM call. Estimated 3–8s.
- **`summarizePages(content, topic, usePlatformCredits)`** — LLM call to adaptively summarize fetched page content to ~4000 chars, filtering for relevance to the topic. Returns summarized text.
- **`reasonAboutTopic(topic, context, targetAudience, summary?, usePlatformCredits)`** — LLM call with a chain-of-thought prompt to produce a markdown research brief identifying relevant frameworks, key dimensions, and best practices. Receives the web summary if web search was also enabled.

### Modified server action

- **`generateTemplate`** — gains an optional `researchBrief` parameter. When provided, uses a different prompt variant that instructs the model to ground its output in the research findings. When absent, uses the existing prompt (zero regression risk).

### Prompt strategy

- **Two prompt variants** for generation: one unchanged (no research), one rewritten to deeply integrate the research brief (e.g., "map each domain to a framework identified," "ensure questions measure the specific practices mentioned").
- The reasoning prompt produces **markdown-formatted** output with headings like "## Relevant Frameworks", "## Key Dimensions", "## Recommended Focus Areas".

### Dependencies (new npm packages)

- `duck-duck-scrape` — free DuckDuckGo search, no API key required
- `@mozilla/readability` — article content extraction (pure JS, Vercel-safe)
- `linkedom` — lightweight server-side DOM for readability (pure JS, Vercel-safe)

### Schema change

Add a nullable `researchBrief` text column to the `templates` table:

```sql
ALTER TABLE templates ADD COLUMN "researchBrief" text;
```

Drizzle schema addition:

```typescript
researchBrief: text("researchBrief"),
```

### UI changes

- **New template form**: Add two independent checkboxes below the existing form fields — "☑ Web Research" and "☑ Deep Reasoning". Show estimated credit cost dynamically (1/2/3) based on what's checked.
- **Progress indicator**: Replace the single "Generating..." spinner with step-by-step status text that updates as each server action completes (e.g., "Searching the web...", "Summarizing findings...", "Reasoning about frameworks...", "Generating template...").
- **Research brief display (creation)**: Collapsible section that appears once research completes, showing the markdown brief. Non-blocking — generation proceeds while it's visible.
- **Research brief display (detail page)**: Collapsible section on the template detail page, rendered only when `researchBrief` is non-null. Shows the persisted markdown brief.

### Error handling

- If web search or page fetching fails, **skip gracefully** and continue with whatever's available. Show a subtle warning: "Web research unavailable, generated using AI reasoning only" (or "generated without research" if neither succeeded).
- No retries. Fail fast, fall back.

### Credit model

- Same key/credit source for all steps in the pipeline. If user selects "platform credits," all LLM calls in the pipeline use platform credits. If user uses their own key, all calls use their key.
- Credits deducted: 1 (no research), 2 (one checkbox), 3 (both checkboxes).

### Vercel Hobby plan constraints

- Each server action is a separate invocation, staying well within the 10-second timeout.
- `searchWeb` split from `fetchPages` to keep each under budget.
- Per-page fetch timeout capped at 2.5 seconds.
- Page fetch count hardcoded to 3.
- All new dependencies are pure JavaScript (no native binaries).

## Testing Decisions

No test framework exists in this project. Manual verification via the existing `pnpm lint` and `pnpm build` pipeline. Functional testing through the UI.

## Out of Scope

- Research on template edit/regeneration — only new creation is supported in this iteration.
- Streaming/SSE for real-time progress — client orchestrates sequential actions instead.
- User-configurable search depth (number of pages, result count) — hardcoded.
- Caching of research results across generations.
- Research for assessment report generation.
- Adding a test framework.

## Further Notes

- The `duck-duck-scrape` library scrapes DuckDuckGo's frontend. If DDG changes their HTML structure, this could break. The graceful fallback ensures the feature degrades without blocking users. Alternative libraries (`@navetacandra/ddg`) can be swapped in with minimal interface change.
- The research brief is markdown, which renders nicely with minimal effort (simple `whitespace-pre-wrap` or a lightweight markdown renderer).
- Future iterations could add: research on edit, caching research results, user-configurable depth, or upgrading to a paid search API if DDG scraping becomes unreliable.
