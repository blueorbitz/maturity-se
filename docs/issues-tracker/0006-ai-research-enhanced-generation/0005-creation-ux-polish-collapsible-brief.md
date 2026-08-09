## Parent

PRD: `docs/prd/0006-ai-research-enhanced-generation.md`

## What to build

Add the collapsible research brief section to the template creation flow. When research completes (before or during generation), the brief appears in an expandable panel so the creator can inspect what informed the template. This is non-blocking — it doesn't require user interaction to proceed.

**Collapsible research brief during creation:**
- After the research step(s) complete, display the markdown research brief in a collapsible/expandable section in the form area
- The section should be collapsed by default but visually indicate content is available (e.g., "Research brief ▸" with a subtle indicator)
- Expanding shows the markdown content rendered as formatted text (can use `whitespace-pre-wrap` with the existing prose styling, or a lightweight markdown approach matching the project's style)
- The section persists while generation runs and after the template draft appears
- If no research was performed, the section does not render

## Acceptance criteria

- [ ] A collapsible section appears after research completes during template creation
- [ ] The section is collapsed by default
- [ ] Expanding the section shows the research brief as formatted text
- [ ] The section does not appear when no research was performed (no checkboxes enabled)
- [ ] The section remains visible after generation completes and the template editor appears
- [ ] The collapsible interaction does not block or interrupt the generation pipeline
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes

## Blocked by

- `docs/issues-tracker/0006-ai-research-enhanced-generation/0004-template-form-research-checkboxes-orchestration.md`
