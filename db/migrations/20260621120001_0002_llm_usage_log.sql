-- migrate:up
ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS "defaultLlmMode" text NOT NULL DEFAULT 'own_key';

CREATE TABLE IF NOT EXISTS "llm_usage_log" (
  "id" text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "feature" text NOT NULL DEFAULT 'template_generation',
  "provider" text NOT NULL,
  "model" text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE "promo_code_redemptions"
  ADD CONSTRAINT "promo_code_redemptions_user_code_unique"
  UNIQUE ("userId", "promoCodeId");
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- migrate:down
DROP TABLE IF EXISTS "llm_usage_log";
ALTER TABLE "user" DROP COLUMN IF EXISTS "defaultLlmMode";
ALTER TABLE "promo_code_redemptions" DROP CONSTRAINT IF EXISTS "promo_code_redemptions_user_code_unique";
