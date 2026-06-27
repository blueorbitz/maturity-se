# H0 Hackathon Submission Post — Maturity-SE

Copy-paste this into your Devpost submission. Fill in `[brackets]` with your actual values.

---

## Inspiration

Engineering teams talk about "maturity" all the time — DORA metrics, Team Topologies, DevSecOps capability models — but almost nobody measures it. The few who do rely on consultant PDFs that go stale in a month, or spreadsheet templates that sit in a shared drive gathering dust.

I've been on the other side of this. As an engineering leader, you know something is off — velocity is dropping, incidents are creeping up, teams are siloed — but you can't pinpoint what or where because there's no systematic way to assess and track maturity over time. The tools that exist are either too generic (survey platforms with no engineering context) or too expensive (consulting engagements that cost six figures).

Maturity-SE exists to fix that: a purpose-built tool for engineering leaders to run maturity assessments, visualize results, and track improvement — without a consultant, without a spreadsheet, and without guessing.

---

## What it does

Maturity-SE is a B2B SaaS application that helps engineering leaders measure and improve team maturity across software engineering domains.

**Core workflow:**

1. **Create a template** — Describe a topic (e.g., "DevSecOps maturity") and either have AI generate a full questionnaire with domains, questions, and a 5-tier maturity scale, or build one manually with a drag-and-drop editor.
2. **Launch an assessment** — Generate a unique invite link. No login required for respondents — team members click the link and answer.
3. **Collect responses** — Team members rate themselves across dimensions like deployment frequency, incident response, code review culture, and documentation practices.
4. **View reports** — Owners see aggregated maturity scores via radar charts, bar charts, score distributions, per-domain breakdowns, and per-respondent averages.

**Key features:**

- AI-powered template generation using OpenAI or AWS Bedrock
- Public template gallery — browse, search, and clone community-shared assessment frameworks
- Multi-step respondent experience with progress tracking
- Rich visualizations: radar charts, bar charts, histograms, per-domain drill-downs
- Team comparison and trend tracking over time
- BYOK (Bring Your Own Key) with AES-256-GCM encrypted API key storage
- Promo code system for platform-provided LLM credits

---

## How we built it

**Stack:**

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| UI | shadcn/ui, Tailwind CSS 4, Recharts |
| Database | PostgreSQL (Amazon Aurora PostgreSQL) |
| ORM | Drizzle ORM |
| Migrations | dbmate |
| Auth | Better Auth (email + password) |
| AI | AWS Bedrock Runtime SDK + OpenAI API |
| Deployment | Vercel (scaffolded with v0) |

**Architecture:**

- **v0** scaffolded the initial UI — shadcn components, Tailwind styling, and page layouts generated in minutes. From there, I customized every component and wired up the data layer.
- **Server Actions** handle all data mutations — no API routes, keeping the data flow clean and type-safe.
- **Drizzle ORM** maps the schema across 10 tables: users, sessions, templates, assessments, responses, LLM keys, promo codes, redemptions, usage logs, and verifications.
- **dbmate** manages migrations with sequential SQL files — reliable, version-controlled, no ORM lock-in.
- **Amazon Aurora PostgreSQL** stores all assessment data. Maturity data is inherently relational — teams belong to organizations, assessments have versions, scores have history. Aurora gives ACID transactions, complex queries, and production-grade reliability without managing infrastructure.
- **AES-256-GCM encryption** protects user API keys at rest, derived from the auth secret via PBKDF2 (100k iterations).

**Data model highlights:**

- Templates store domains and questions as JSONB — flexible enough for any assessment framework while keeping relational integrity for users and assessments.
- Assessment invite tokens are unique nanoids — no login required to respond, but results are tied back to the assessment owner.
- Responses store answers as a `Record<string, number>` JSONB map — lightweight, queryable, and schema-agnostic across different templates.

---

## Challenges we ran into

**1. v0 credit burnout**

The $30 v0 credit went much faster than expected. I started with v0-pro to bootstrap the UI, which consumed most of the budget on a single round of trial-and-error iteration. By the time I had the remaining credits, I had to switch to v0-mini — but the quality of output dropped noticeably. Components missing edge cases, and feedback that didn't catch real bugs. I ended up abandoning v0 for the bulk of development and building locally instead. The lesson: v0 is excellent for that first spark, but don't budget your entire hackathon on it.

**2. Preview chaos across sessions and branches**

Working on v0 with multiple sessions and Git branches made the preview mode unreliable. When I attempted a large refactor — restructuring the data model and page routing — the preview failed spectacularly. It would render stale code, mix branch states, or just show a blank screen. This forced me to redo the entire build from scratch in a clean session rather than iterating incrementally. For hackathon-scale changes, v0's preview system doesn't hold up.

**3. AWS Database creation through v0 — the promise vs. reality**

The v0 + AWS integration looked seamless on paper. v0 prompted me for IAM credentials, walked me through the setup, and felt like it was handling the infrastructure side intelligently. I trusted it to provision the database. Then it failed — silently. No clear error message, no guidance on what went wrong, no fallback path. I spent hours trying to debug this. I had no idea whether the issue was IAM permissions, VPC config, region mismatch, or something else entirely. The error handling gave me nothing to work with.

I tried again on a separate day with Aurora PostgreSQL, and once it passed the initial creation, the rest of the process was rather smooth. However, a bug surfaced where I was unable to view the database directly in v0 — possibly due to the "prefix" I added during creation. More critically, the initial code generated by v0 to connect to AWS kept failing. I had to resort to pulling the project to local and debugging from there before I could get the connection working. The "zero config" promise didn't survive contact with reality.

**4. Trust origin and CORS nightmares**

v0's preview mode has internal magic that handles origins differently from a real deployment. I kept hitting trust origin errors — requests succeeded in the v0 preview but failed when opened in a separate tab or deployed to Vercel. I tried using v0-llm to debug the issue, but it couldn't diagnose the root cause — it kept suggesting fixes for problems that didn't exist. The issue only resolved when I moved the project to local development, where I could inspect the actual network requests and see what was happening. Some bugs need a real terminal, not an AI sandbox.

---

## What we learned

- **v0 is a spark, not a furnace.** It's incredible for generating that first UI skeleton in minutes — saved hours of boilerplate. But credit burns fast, output quality drops on cheaper models, and complex refactors break the preview. Use v0 to start, then migrate to local development once the scope grows. I was rather surprise the moment I manage to fix the bug on the local, many feature was indeed implemented quite nicely.
- **Preview environments have limits.** v0's preview mode mixes session state, struggles with branch switching, and introduces origin quirks that don't exist in real deployments. For any non-trivial architecture change, a clean local environment is more reliable.
- **AI debugging has a ceiling.** v0-llm couldn't diagnose trust origin issues because the problem was specific to v0's internal proxy behavior — something the model had no visibility into. Some bugs require traditional debugging: terminal output, network inspection, and reading the actual error. I even ask it to write unit test to debug the endpoint, but it still can't resolve the issue.
- **AI-guided infra setup needs a manual fallback.** v0 made the AWS IAM setup feel guided and smart, but when it came time to actually create the database, it failed silently with no useful error. The "magic" wrapper couldn't handle the real complexity. That said, a second attempt on a later day went much smoother once the initial creation passed — the remaining setup flowed naturally. The catch: the generated connection code still failed, forcing a move to local debugging. For anything involving cloud infrastructure, expect to end up in the console and the terminal.
- **The vibe coding flow is real but fragile.** AI-assisted development dramatically accelerates the happy path — generating components, scaffolding pages, writing boilerplate. But the moment something breaks the assumptions (wrong branch, stale preview, CORS mismatch), you need to drop back to fundamentals. The winning strategy is knowing when to let AI drive and when to take the wheel.

---

## What's next for Maturity-SE

- **Aurora PostgreSQL production hardening** — Connection pooling, automated backups, read replicas for reporting queries, and CloudWatch monitoring.
- **Trend tracking** — Compare maturity scores across assessment cycles to show improvement (or regression) over time.
- **Team comparison dashboards** — Side-by-side radar charts for multiple teams, with organization-wide averages.
- **Integration with engineering tools** — Pull DORA metrics from GitHub Actions, incident data from PagerDuty, or sprint velocity from Jira to auto-populate assessment responses.
- **API access** — REST API for programmatic assessment creation and result retrieval, enabling CI/CD integration and automated reporting.
- **Multi-language support** — Assessments in Spanish, Mandarin, and other languages for global engineering teams.
- **Mobile-responsive respondent flow** — Optimize the survey experience for mobile devices so team members can complete assessments on the go.
