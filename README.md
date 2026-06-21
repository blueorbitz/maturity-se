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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
