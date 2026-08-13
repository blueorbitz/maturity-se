## Parent

PRD: `docs/prd/0006-ai-research-enhanced-generation.md`

## What to build

Add a nullable `researchBrief` text column to the `templates` table. This stores the markdown-formatted research brief that informed an AI-generated template. Existing templates will have `null` — no backfill needed.

This involves:
- Adding the column to the Drizzle schema definition for the `templates` table
- Creating a dbmate migration that adds the column

The feature must not break any existing template creation, editing, or display flows.

## Acceptance criteria

- [ ] `templates` table has a new nullable `researchBrief` text column
- [ ] Drizzle schema includes `researchBrief: text("researchBrief")` on the templates table definition
- [ ] A dbmate migration file exists that runs `ALTER TABLE templates ADD COLUMN "researchBrief" text`
- [ ] `pnpm db:migrate` runs successfully
- [ ] `pnpm build` passes with no type errors
- [ ] Existing template CRUD (create, read, update, delete) continues to work unchanged

## Blocked by

None — can start immediately
