-- migrate:up
ALTER TABLE "promo_codes"
ADD COLUMN IF NOT EXISTS "enabled" boolean NOT NULL DEFAULT true;

-- migrate:down
ALTER TABLE "promo_codes"
DROP COLUMN IF EXISTS "enabled";
