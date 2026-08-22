# maturity-se

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_6lPVqv7tjJPJTXRK1e0neNeJRBtY)

## Environment Variables

Copy `.env.example` to `.env.development.local` and fill in the values:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (e.g. `postgres://user:pass@localhost:5432/dbname`) |
| `BETTER_AUTH_SECRET` | ✅ | Secret for session signing & encrypting stored LLM keys. Generate with `openssl rand -hex 32` |
| `ADMIN_EMAILS` | ❌ | Comma-separated list of emails that get admin access (promo codes, etc.) |
| `AWS_ACCESS_KEY_ID` | ❌ | AWS Access Key for Bedrock (fallback LLM for users without their own key) |
| `AWS_SECRET_ACCESS_KEY` | ❌ | AWS Secret Access Key for Bedrock |
| `PLATFORM_LLM_REGION` | ❌ | AWS region for platform Bedrock calls (default: `us-east-1`) |
| `PLATFORM_LLM_MODEL` | ❌ | Bedrock model ID for platform calls (default: `minimax.minimax-m2.5`) |
| `TAVILY_API_KEY` | ❌ | Tavily API key for web research feature. Get one at [tavily.com](https://tavily.com) |
| `BETTER_AUTH_URL` | ❌ | Override base URL for auth callbacks. Normally auto-detected from Vercel env vars |

## Getting Started

1. Copy the example env file and fill in the required values:
   ```bash
   cp .env.example .env.development.local
   ```
2. Run the database migrations:
   ```bash
   pnpm db:migrate
   ```
3. Start the dev server:
   ```bash
   pnpm dev
   ```

4. To update env from vercel
   ```bash
   vercel link
   vercel env pull .env.development.local
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Onboarding Tutorial

New to the project? Start with the interactive onboarding tutorial:

**[Start the Onboarding Tutorial →](https://blueorbitz.github.io/maturity-se/teach/maturity-se-onboarding/)**

5 lessons (~50 min total) covering the core loop, local setup, DB schema, auth guards, and end-to-end feature tracing. Each lesson has interactive quizzes to build lasting understanding.

| Lesson | Topic | Win |
|--------|-------|-----|
| [1. The 60-Second Mental Model](https://blueorbitz.github.io/maturity-se/docs/teach/maturity-se-onboarding/lessons/0001-repo-map.html) | Core product loop & folder layout | Explain Template → Assessment → Response → Report |
| [2. Run It Locally](https://blueorbitz.github.io/maturity-se/docs/teach/maturity-se-onboarding/lessons/0002-local-run.html) | Env vars, db/run.js, migrations | Get pnpm dev + db running locally |
| [3. DB Schema](https://blueorbitz.github.io/maturity-se/docs/teach/maturity-se-onboarding/lessons/0003-db-schema.html) | The four tables that matter | Read any Drizzle query and predict the result |
| [4. Auth Guards](https://blueorbitz.github.io/maturity-se/docs/teach/maturity-se-onboarding/lessons/0004-auth-guards.html) | Layout vs action guards | Trace any route to its auth check |
| [5. End-to-End Trace](https://blueorbitz.github.io/maturity-se/docs/teach/maturity-se-onboarding/lessons/0005-trace.html) | Follow one feature through every file | Trace any feature in under 5 min |

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
