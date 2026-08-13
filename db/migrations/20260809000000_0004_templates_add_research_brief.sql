-- migrate:up
ALTER TABLE "templates"
ADD COLUMN IF NOT EXISTS "researchBrief" text;

-- migrate:down
ALTER TABLE "templates"
DROP COLUMN IF EXISTS "researchBrief";