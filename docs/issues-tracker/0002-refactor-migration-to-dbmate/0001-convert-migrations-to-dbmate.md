# Issue 1: Convert Migrations to dbmate

## What to build

Refactor the migration system from manually-executed Node.js scripts to dbmate. This involves:

1. Installing dbmate as a dev dependency
2. Converting existing migrations 001, 002, and 003 to dbmate SQL format (with `-- migrate:up` and `-- migrate:down` sections)
3. Using the naming convention `YYYYMMDDHHMMSS_NNNN_name.sql` (timestamp + numbered prefix)
4. Adding npm scripts for `db:migrate`, `db:rollback`, `db:new`, `db:dump`
5. Removing the old migration files after conversion

The migration content must include `IF NOT EXISTS` / `IF EXISTS` guards to be safe on both local (already applied) and production (partially applied) databases.

## Acceptance criteria

- [ ] dbmate is installed as a dev dependency (`npm install --save-dev dbmate`)
- [ ] `db/migrations/20260621120000_0001_promo_codes.sql` exists with correct up/down SQL
- [ ] `db/migrations/20260621120001_0002_llm_usage_log.sql` exists with correct up/down SQL
- [ ] `db/migrations/20260621120002_0003_promo_codes_add_enabled.sql` exists with correct up/down SQL
- [ ] `package.json` includes scripts: `db:migrate`, `db:rollback`, `db:new`, `db:dump`
- [ ] Old migration files are removed: `001_promo_codes_up.js`, `001_promo_codes_down.js`, `001_promo_codes_seed.js`, `002_llm_usage_log_up.js`, `002_llm_usage_log_down.js`, `003_promo_codes_add_enabled_up.js`, `003_promo_codes_add_enabled_down.js`
- [ ] `dbmate up` applies successfully on a fresh database
- [ ] `dbmate up` is idempotent (running twice produces no errors)
- [ ] `dbmate rollback` undoes the most recent migration
- [ ] `schema_migrations` table is created and tracks applied migrations

## Blocked by

None — can start immediately
