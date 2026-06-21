# PRD: Refactor Migration System to dbmate

## Problem Statement

The current migration system consists of 5 manually-executed Node.js scripts (`001_promo_codes_up.js`, `001_promo_codes_down.js`, `001_promo_codes_seed.js`, `002_llm_usage_log_up.js`, `002_llm_usage_log_down.js`). This approach has several issues:

1. **No migration tracking** — There is no record of which migrations have been applied to which database. Developers must manually track state.
2. **Duplicated boilerplate** — Every file contains an identical copy of the `loadEnv()` function (6 copies across 5 files).
3. **No automated rollback** — Rollback requires manually running a separate script; there is no built-in `rollback` command.
4. **Local/production drift** — Production is missing migration 002 (`llm_usage_log` table, `defaultLlmMode` column, unique constraint on `promo_code_redemptions`). Local has it applied. There is no way to detect or resolve this drift automatically.
5. **WIP migrations at risk** — Additional migrations are in progress on a WIP branch. These must be preserved and applied to production during the refactor.

## Solution

Adopt [dbmate](https://github.com/amacneil/dbmate) as the migration runner. dbmate is a lightweight, framework-agnostic tool that:

- Uses plain SQL files with `-- migrate:up` and `-- migrate:down` sections
- Tracks applied migrations in a `schema_migrations` table automatically
- Provides built-in `dbmate up`, `dbmate rollback`, `dbmate new` commands
- Runs migrations atomically inside transactions
- Works alongside Drizzle ORM (Drizzle for app queries, dbmate for migrations)

Convert existing migrations 001 and 002 to dbmate format, preserving the numbered prefix convention (`0001_`, `0002_`) for traceability to the issue tracker.

## User Stories

1. As a developer, I want to run `dbmate up` to apply all pending migrations, so that I don't have to remember which scripts to execute.
2. As a developer, I want to run `dbmate rollback` to undo the most recent migration, so that I can recover from mistakes.
3. As a developer, I want `dbmate new <name>` to generate a timestamped migration file, so that I don't have to invent filenames.
4. As a developer, I want the `schema_migrations` table to track applied migrations, so that running `dbmate up` twice is safe (idempotent).
5. As a developer, I want migration 001 (`promo_codes` tables) to be represented in dbmate format, so that it can be applied to production.
6. As a developer, I want migration 002 (`llm_usage_log` table, `defaultLlmMode` column, unique constraint) to be represented in dbmate format, so that it can be applied to production (which is currently missing it).
7. As a developer, I want the WIP migrations to be preserved during the refactor, so that in-progress work is not lost.
8. As a developer, I want the old migration files removed after conversion, so that there is a single source of truth for migrations.
9. As a developer, I want the migration naming convention to include the numbered prefix (`0001_`, `0002_`), so that migrations are traceable to the issue tracker.
10. As a developer, I want seed data files to be removed, so that the migration system is focused solely on schema changes.
11. As a developer, I want `dbmate dump` to capture the current schema state, so that I can diff schema changes in git.
12. As a developer, I want the `.env` loading to be handled by dbmate natively (via `DATABASE_URL`), so that the duplicated `loadEnv()` boilerplate is eliminated.

## Implementation Decisions

### Migration Tool

- **Tool:** dbmate (installed via npm as a dev dependency)
- **Config:** `DATABASE_URL` environment variable (already exists in `.env.development.local`)
- **Migration directory:** `migrations/` (same location, new file format)

### File Naming Convention

```
migrations/
├── 20260621120000_0001_promo_codes.sql
├── 20260621120001_0002_llm_usage_log.sql
└── 20260621120002_<future_migration>.sql
```

- Timestamp prefix (`YYYYMMDDHHMMSS`) ensures ordering and avoids conflicts between developers
- Numbered prefix (`0001_`, `0002_`) preserves traceability to the issue tracker
- Each file contains both `-- migrate:up` and `-- migrate:down` sections

### Migration Content

**001_promo_codes.sql (up):**
- Creates `promo_codes` table
- Creates `promo_code_redemptions` table with foreign keys

**001_promo_codes.sql (down):**
- Drops `promo_code_redemptions` table
- Drops `promo_codes` table

**002_llm_usage_log.sql (up):**
- Adds `defaultLlmMode` column to `user` table (with `IF NOT EXISTS` guard)
- Creates `llm_usage_log` table
- Adds unique constraint on `promo_code_redemptions(userId, promoCodeId)` (with exception handling)

**002_llm_usage_log.sql (down):**
- Drops `llm_usage_log` table
- Removes `defaultLlmMode` column from `user` table
- Drops unique constraint on `promo_code_redemptions`

### Safety Guards

All migrations use `IF NOT EXISTS` / `IF EXISTS` / exception handling to be safe on both local (already applied) and production (not yet applied) databases. This means:
- Running `dbmate up` on local (which already has these changes) will be a no-op
- Running `dbmate up` on production (which is missing 002) will apply the missing changes

### Package.json Scripts

Add the following scripts to `package.json`:

```json
{
  "scripts": {
    "db:migrate": "dbmate up",
    "db:rollback": "dbmate rollback",
    "db:new": "dbmate new",
    "db:dump": "dbmate dump"
  }
}
```

### Files to Remove

After conversion, remove the old migration files:
- `migrations/001_promo_codes_up.js`
- `migrations/001_promo_codes_down.js`
- `migrations/001_promo_codes_seed.js`
- `migrations/002_llm_usage_log_up.js`
- `migrations/002_llm_usage_log_down.js`

## Testing Decisions

### Testing Approach

Tests should verify that:
1. `dbmate up` applies migrations successfully on a fresh database
2. `dbmate up` is idempotent (running twice produces no errors)
3. `dbmate rollback` undoes the most recent migration
4. The `schema_migrations` table is correctly updated after up/rollback

### Key Test Scenarios

- Fresh database: `dbmate up` creates all tables correctly
- Existing database with 001 applied: `dbmate up` applies only 002 (no-op for 001)
- Existing database with both 001 and 002 applied: `dbmate up` is a no-op
- `dbmate rollback` after applying 002: removes 002 changes, 001 remains
- `dbmate rollback` after applying 001: removes 001 changes (cascading drops)

### Prior Art

Existing test file: `__tests__/template-generation.test.ts` — uses raw assertions without a test framework.

## Out of Scope

- Drizzle Kit integration (migrations remain raw SQL, not generated from schema)
- Automated CI/CD pipeline for migrations (can be added later)
- Schema dump synchronization (`dbmate dump` is available but not automated)
- Migration of Better Auth tables (managed by Better Auth internally)

## Further Notes

- The `schema_migrations` table is created automatically by dbmate on first run
- dbmate reads `DATABASE_URL` from `.env` files natively — no custom `loadEnv()` needed
- The WIP branch migrations should be converted to dbmate format before or during the refactor to avoid conflicts
- Production deployment should run `dbmate up` as part of the deploy process
