## Parent

PRD: `docs/prd/0006-ai-research-enhanced-generation.md`

## What to build

Display the persisted research brief on the template detail page. When a template has a non-null `researchBrief`, show it in a collapsible section so users can revisit the research that informed the template's domains and questions.

**Template detail page addition:**
- Add a collapsible section between the meta row (badges) and the scale card
- Only renders when the template's `researchBrief` field is non-null
- Section header: something like "Research Brief" with an expand/collapse affordance
- Content: the markdown research brief rendered as formatted text
- Collapsed by default to keep the page focused on the template content

## Acceptance criteria

- [ ] Template detail page shows a collapsible "Research Brief" section when `researchBrief` is non-null
- [ ] The section does not render when `researchBrief` is null (templates created without research)
- [ ] The section is collapsed by default
- [ ] Expanding shows the research brief as formatted text
- [ ] The section is positioned between the meta badges and the scale card
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes

## Blocked by

- `docs/issues-tracker/0006-ai-research-enhanced-generation/0001-schema-migration-add-research-brief-column.md`
