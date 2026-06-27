# AGENTS.md

## Setup

- Package manager: **pnpm** (not npm, not yarn)
- Install: `pnpm install`
- Dev: `pnpm dev`
- Lint: `pnpm lint`
- Database migrations: `pnpm db:migrate` (dbmate, reads `DATABASE_URL` from env)
- Production deploys run `pnpm build` which chains `dbmate up` automatically
- Locally, `db/run.js` loads `.env.development.local` via dotenv-cli
- No need to update `next-env.d.ts` to switch between dev or prod.

## Conventions

- TypeScript strict mode
- Single quotes, no semicolons
- Use functional patterns where possible
- Server actions for data mutations (not API routes)
- Drizzle ORM for queries, dbmate for migrations

## Before committing

- Run `pnpm lint` and fix any errors
- Run `pnpm build` to verify no type errors
