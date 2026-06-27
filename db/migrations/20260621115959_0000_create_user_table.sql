-- migrate:up
-- ─── Better Auth Tables ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "image" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY,
  "expiresAt" timestamp NOT NULL,
  "token" text NOT NULL UNIQUE,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "password" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp,
  "updatedAt" timestamp
);

-- ─── App Tables ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "templates" (
  "id" text PRIMARY KEY,
  "userId" text NOT NULL,
  "title" text NOT NULL,
  "topic" text NOT NULL,
  "context" text,
  "targetAudience" text NOT NULL,
  "scaleLength" integer NOT NULL DEFAULT 5,
  "scaleLevels" jsonb NOT NULL DEFAULT '[]',
  "domains" jsonb NOT NULL DEFAULT '[]',
  "visibility" text NOT NULL DEFAULT 'private',
  "clonedFromId" text,
  "generatedByAi" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "assessments" (
  "id" text PRIMARY KEY,
  "userId" text NOT NULL,
  "templateId" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "status" text NOT NULL DEFAULT 'draft',
  "inviteToken" text NOT NULL UNIQUE,
  "teamName" text,
  "dueDate" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "responses" (
  "id" text PRIMARY KEY,
  "assessmentId" text NOT NULL,
  "respondentName" text,
  "respondentRole" text,
  "answers" jsonb NOT NULL DEFAULT '{}',
  "submittedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "llm_keys" (
  "id" text PRIMARY KEY,
  "userId" text NOT NULL UNIQUE,
  "provider" text NOT NULL,
  "encryptedKey" text NOT NULL,
  "keyHint" text,
  "model" text,
  "apiFormat" text NOT NULL DEFAULT 'anthropic',
  "awsRegion" text,
  "awsAccessKeyId" text,
  "encryptedAwsSecretKey" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE IF EXISTS "llm_keys";
DROP TABLE IF EXISTS "responses";
DROP TABLE IF EXISTS "assessments";
DROP TABLE IF EXISTS "templates";
DROP TABLE IF EXISTS "verification";
DROP TABLE IF EXISTS "account";
DROP TABLE IF EXISTS "session";
DROP TABLE IF EXISTS "user";
