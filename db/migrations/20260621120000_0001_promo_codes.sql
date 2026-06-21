-- migrate:up
CREATE TABLE IF NOT EXISTS "promo_codes" (
  "id" text PRIMARY KEY,
  "code" text NOT NULL UNIQUE,
  "generations" integer NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "promo_code_redemptions" (
  "id" text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "promoCodeId" text NOT NULL REFERENCES "promo_codes"("id") ON DELETE cascade,
  "redeemedAt" timestamp NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE IF EXISTS "promo_code_redemptions";
DROP TABLE IF EXISTS "promo_codes";
