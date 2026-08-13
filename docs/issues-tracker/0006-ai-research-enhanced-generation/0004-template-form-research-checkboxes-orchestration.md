## Parent

PRD: `docs/prd/0006-ai-research-enhanced-generation.md`

## What to build

Wire up the research pipeline in the new template creation form. Add two independent checkboxes, orchestrate the server actions sequentially from the client, display dynamic credit cost, and persist the research brief when saving.

**UI additions to the new template form:**
- Two independent checkboxes: "☑ Web Research" and "☑ Deep Reasoning", placed below the existing form fields (near the LLM source toggle area)
- Dynamic credit cost indicator that updates based on checkbox state: "1 credit" / "2 credits" / "3 credits"
- Both checkboxes default to unchecked (existing behavior preserved)
- Checkboxes are disabled when the form is generating

**Client-side orchestration:**
- Based on which checkboxes are checked, call the appropriate server actions sequentially:
  - No research: `generateTemplate` (existing flow)
  - Web Research only: `searchWeb` → `fetchPages` → `summarizePages` → `generateTemplate(with summary as brief)`
  - Deep Reasoning only: `reasonAboutTopic` → `generateTemplate(with brief)`
  - Both: `searchWeb` → `fetchPages` → `summarizePages` → `reasonAboutTopic(with summary)` → `generateTemplate(with brief)`
- Pass the research brief to `generateTemplate` via the new optional parameter
- If web search/fetch fails (returns empty), continue pipeline without that data, show a warning

**Saving the brief:**
- Update `SaveTemplateSchema` to accept an optional `researchBrief` string field
- Update `saveTemplate` action to persist `researchBrief` to the templates table
- When saving a template that was generated with research, include the research brief in the save payload

**Basic progress:**
- Update the generating spinner label to show which step is active: "Searching the web...", "Fetching pages...", "Summarizing findings...", "Reasoning about frameworks...", "Generating template..."
- Each label updates as the corresponding action is called

## Acceptance criteria

- [ ] Two checkboxes ("Web Research" and "Deep Reasoning") appear in the new template form
- [ ] Checkboxes are independent (can check either, both, or neither)
- [ ] Credit cost indicator shows 1/2/3 based on checkbox state
- [ ] When no checkboxes are checked, existing generation flow works unchanged
- [ ] When "Web Research" is checked, the web pipeline runs before generation
- [ ] When "Deep Reasoning" is checked, the reasoning action runs before generation
- [ ] When both are checked, the full pipeline runs (web → summarize → reason → generate)
- [ ] Research brief is passed to `generateTemplate` when available
- [ ] Web search failure degrades gracefully with a warning (generation still proceeds)
- [ ] `SaveTemplateSchema` accepts optional `researchBrief`
- [ ] `saveTemplate` persists `researchBrief` to the database
- [ ] Progress label updates per step during generation
- [ ] Checkboxes are disabled during generation
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes

## Blocked by

- `docs/issues-tracker/0006-ai-research-enhanced-generation/0001-schema-migration-add-research-brief-column.md`
- `docs/issues-tracker/0006-ai-research-enhanced-generation/0002-deep-reasoning-research-action.md`
- `docs/issues-tracker/0006-ai-research-enhanced-generation/0003-web-search-fetch-summarize-actions.md`
