## Parent

PRD: `docs/prd/0006-ai-research-enhanced-generation.md`

## What to build

Create the web research server actions that power the "Web Research" checkbox. This delivers the full web research pipeline at the action layer: search → fetch → summarize.

**New dependencies to install:**
- `duck-duck-scrape` — free DuckDuckGo search, no API key
- `@mozilla/readability` — article content extraction (pure JS)
- `linkedom` — lightweight server-side DOM (pure JS)

**New action: `searchWeb`**
- Accepts: topic (string)
- Uses `duck-duck-scrape` to query DuckDuckGo
- Returns top 5 results as an array of `{ title, url, snippet }`
- On failure: returns an empty array (graceful fallback, no throw)

**New action: `fetchPages`**
- Accepts: array of URLs (string[])
- Fetches top 3 URLs with a 2.5-second timeout per page using `AbortController`
- Extracts article content using `@mozilla/readability` + `linkedom`
- Returns extracted text per page (array of strings)
- On per-page failure: skips that page and continues with remaining
- If all fail: returns empty array (graceful fallback)

**New action: `summarizePages`**
- Accepts: extracted page contents (string[]), topic (string), usePlatformCredits flag
- Concatenates page text and sends to LLM with a prompt instructing adaptive summarization to ~4000 chars, filtering for relevance to the topic
- Uses same key/credential source logic as other actions
- Logs one entry to `llmUsageLog` with feature "template_research_summarize" (deducts 1 credit)
- Returns the summarized text as a string
- On failure: throws (caller handles fallback)

## Acceptance criteria

- [ ] `duck-duck-scrape`, `@mozilla/readability`, and `linkedom` are installed as dependencies
- [ ] `searchWeb` action is exported and returns structured search results
- [ ] `searchWeb` gracefully returns empty array on DDG failure (no unhandled throw)
- [ ] `fetchPages` action is exported and returns extracted text content
- [ ] `fetchPages` respects a 2.5-second per-page timeout (uses AbortController or equivalent)
- [ ] `fetchPages` fetches a maximum of 3 pages regardless of input array length
- [ ] `fetchPages` skips individual pages that fail and returns whatever succeeded
- [ ] `summarizePages` action is exported and returns a summarized string
- [ ] `summarizePages` respects the `usePlatformCredits` flag
- [ ] `summarizePages` logs to `llmUsageLog` with feature "template_research_summarize"
- [ ] All new actions are in the research actions file (same file as `reasonAboutTopic`)
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes

## Blocked by

None — can start immediately
