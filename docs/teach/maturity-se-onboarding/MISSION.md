# Mission: Maturity-SE Onboarding

## Why
You're a new engineer on maturity-se — a Next.js app for Software Engineering Maturity Assessments. You need to go from "I don't know what I don't know" to confidently tracing any feature end-to-end, running the app locally, and shipping your first change without breaking auth, DB, or LLM flows.

## Success looks like
- Explain the core loop in 60 seconds: Template → Assessment → inviteToken → Response → Report, and point to where each lives in code
- Run the app locally (`pnpm dev`), run migrations (`pnpm db:migrate`), and know why `db/run.js` exists
- Read `lib/db/schema.ts` and predict what a Drizzle query + a dbmate migration does without guessing
- Make a small server-action change (validation, query, or UI) following the repo conventions (strict TS, single quotes, no semicolons, functional, server actions + Drizzle)
- Know where LLM keys, promo credits, and auth actually live — and where not to touch

## Constraints
- Learning in short bursts — lessons are 5-10 min each, one win per lesson
- No prior context on this codebase; general Next.js / TypeScript / Postgres assumed but not deep Drizzle/better-auth/Tavily knowledge
- Prefer hands-on retrieval over passive reading

## Out of scope
- Deep LLM prompt engineering or model eval — only what the app's pipeline needs
- Infrastructure / Vercel deploy internals beyond "merge to main auto-deploys"
- Full product design critique — focus is engineering orientation
