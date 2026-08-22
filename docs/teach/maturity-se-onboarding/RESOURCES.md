# Maturity-SE Onboarding Resources

## Knowledge

- [README.md — Project overview & env setup](../../../README.md)
  The 2-minute entry point. Use for: what the app is, required env vars, `cp .env.example .env.development.local` flow.
- [AGENTS.md — Setup & conventions](../../../AGENTS.md)
  Single source for package manager (pnpm), scripts (`dev`/`lint`/`db:migrate`/`build`), and code style (strict TS, single quotes, no semicolons, server actions, Drizzle+dbmate). Use for: "how do we do things here?"
- [lib/db/schema.ts — Drizzle schema (source of truth for tables)](../../../lib/db/schema.ts)
  Defines every table: `user/session/account/verification`, `templates`, `assessments`, `responses`, `llm_keys`, `promo_codes`, `promo_code_redemptions`, `llm_usage_log`. Use for: any question about shape of data.
- [db/migrations — dbmate SQL migrations](../../../db/migrations/)
  The actual DDL. Drizzle is query-only here. Use for: understanding what `dbmate up` really does and why `pnpm build` chains it.
- [db/run.js — Env loader for dbmate](../../../db/run.js)
  Loads `.env.development.local` via dotenv-cli and wires Aurora IAM when `USE_AWS_AURORA` is set. Use for: "why does `pnpm db:migrate` need this wrapper?"
- [lib/auth.ts + lib/auth-helpers.ts — better-auth setup](../../../lib/auth.ts)
  Pool adapter, 7-day session, `getUserId()`/`getSession()` guards. Use for: auth flow, trustedOrigins in dev, every server action's first line.
- [lib/llm.ts — LLM dispatch](../../../lib/llm.ts)
  OpenAI vs Bedrock routing, Bedrock error mapping, platform vs BYOK. Use for: template generation, research pipeline.
- [lib/crypto.ts — BYOK encryption](../../../lib/crypto.ts)
  AES-256-GCM via PBKDF2(`BETTER_AUTH_SECRET`, `maturityse-llm-keys`). Use for: `llm_keys` encryption.
- [app/actions/templates.ts — Template lifecycle](../../../app/actions/templates.ts)
  `generateTemplate` (sanitize → LLM → stripReasoningTags → extractFirstJsonObject), `saveTemplate`, `cloneTemplate`, visibility rules. Use for: core domain logic.
- [app/actions/assessments.ts — Assessment & response lifecycle](../../../app/actions/assessments.ts)
  `createAssessment` (nanoid inviteToken), `submitResponse`, status transitions. Use for: respondent flow.
- [app/actions/research.ts — Web research + deep reasoning pipeline](../../../app/actions/research.ts)
  Tavily `searchWeb` → `summarizePages` → `reasonAboutTopic` → `resolveLlm` (credit check). Use for: AI-enhanced generation (1-3 credits).
- [docs/spec — Product specs](../../../docs/spec/)
  Six specs: promo credits, dbmate refactor, usage log, PostHog, template rules, AI research. Use for: why features exist, not just how.

## Wisdom (Communities)

- Local: Codebase itself — `__tests__/template-rules.test.ts` and `__tests__/template-generation.test.ts` show expected invariants
  Use for: quick sanity checks before changing template logic.
- External: Drizzle ORM docs — https://orm.drizzle.team (query patterns used in `app/actions/*`)
  Use for: Drizzle query syntax not covered in-lesson.
- External: better-auth docs — https://better-auth.com
  Use for: session/pool adapter edge cases.

## Gaps

- No centralized architecture decision log beyond `docs/spec/*` — history lives in git log and migration order.
- No staging env docs beyond `AGENTS.md` note about `next-env.d.ts` — verify with team if needed.
