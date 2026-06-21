# PRD: Promo Code Credit System

## Problem Statement

Users currently must bring their own LLM API key (OpenAI or AWS Bedrock) to generate templates with AI. This creates friction for new users who want to try the platform before committing their own credentials. There is no way for the platform operator to offer free trial generations or promotional access without requiring users to set up billing with an LLM provider first.

## Solution

Introduce a promo code system where the platform operator can create codes that grant users a configurable number of free LLM-powered template generations. Users can choose between using their own LLM key (existing BYOK model) or consuming platform-provided credits. Platform credits use the operator's AWS Bedrock credentials stored in environment variables, so users never see or need the platform's API keys.

## User Stories

1. As a new user, I want to redeem a promo code in Settings so that I can try AI template generation without setting up my own LLM provider.
2. As a user, I want to see how many platform generations I have remaining so that I know when I need to add my own key or get another code.
3. As a user, I want to choose between using my own LLM key and using platform credits so that I have control over what I'm spending.
4. As a user, I want my LLM preference to be remembered so that I don't have to choose every time I generate a template.
5. As a user, I want to override my default LLM preference on a per-generation basis so that I can use platform credits for one-off experiments.
6. As a user, I want to be prompted to add a key or redeem a code when I have neither credits nor a saved key, so that I'm not stuck without options.
7. As a user, I want to see an error if I enter an invalid, expired, or already-redeemed promo code, so that I understand what went wrong.
8. As a user, I want to see a success message with the number of generations granted when I redeem a valid code, so that I know it worked.
9. As a user, I want promo credits to expire on a fixed date so that I'm aware of any time limitations.
10. As an operator, I want to create promo codes with a configurable number of generations and an expiry date, so that I can run promotions of varying sizes and durations.
11. As an operator, I want to see how many times each promo code has been redeemed, so that I can track uptake.
12. As an operator, I want each promo code to be usable only once per user, so that credits aren't abused.
13. As an operator, I want an admin page to create and view promo codes, so that I don't need to write raw SQL.
14. As an operator, I want each LLM generation to be logged with the user, feature, and provider, so that I can audit usage and calculate costs.
15. As an operator, I want the credit system to be feature-agnostic in the schema so that it can extend to other LLM features (report analysis, assessment insights) in the future.
16. As a user, if I try to generate a template using platform credits but have none remaining, I want a clear message telling me to add a key or redeem a code.
17. As a user, if I try to generate a template using my own key but have no key saved, I want a clear message directing me to Settings.
18. As a user, I want the promo code input field to accept case-insensitive codes, so that I don't get tripped up by casing.
19. As an operator, I want promo codes to be stored as uppercase-normalized strings, so that matching is consistent.
20. As a user, I want the remaining credits count to update immediately after I redeem a code, without requiring a page refresh.

## Implementation Decisions

### Database Schema

Three new tables and one column addition to the existing `user` table:

**`promo_codes`** — defines available codes, created by the operator.
- `id` (text, primary key, nanoid)
- `code` (text, unique, not null) — stored uppercase-normalized
- `generations` (integer, not null) — total generations granted per redemption
- `expires_at` (timestamp, not null) — fixed expiry date for all redemptions of this code
- `created_at` (timestamp, default now)

**`promo_code_redemptions`** — tracks who redeemed what.
- `id` (text, primary key, nanoid)
- `user_id` (text, not null, FK to user)
- `promo_code_id` (text, not null, FK to promo_codes)
- `redeemed_at` (timestamp, default now)
- Unique constraint on `(user_id, promo_code_id)` — one redemption per user per code

**`llm_usage_log`** — logs every LLM call made through the platform.
- `id` (text, primary key, nanoid)
- `user_id` (text, not null, FK to user)
- `feature` (text, not null, default `'template_generation'`) — extensible to future features
- `provider` (text, not null) — `'platform'`, `'openai'`, or `'bedrock'`
- `model` (text, nullable) — e.g. `'minimax.minimax-m2.5'`
- `created_at` (timestamp, default now)

**`user` table modification** — add `default_llm_mode` column:
- `default_llm_mode` (text, default `'own_key'`) — `'own_key'` or `'platform_credits'`

### Server Actions

**New file: `app/actions/promo-codes.ts`**
- `redeemPromoCode(code: string)` — validates code exists, is not expired, has not been redeemed by the user; inserts redemption; returns success with remaining generations count
- `getMyCredits()` — joins redemptions with usage log to compute `{ totalGranted, used, remaining }`

**New file: `app/actions/admin.ts`**
- `createPromoCode(code: string, generations: number, expiresAt: Date)` — operator creates a code (protected by admin check)
- `getPromoCodes()` — lists all codes with redemption count (left join on redemptions)

**Modify: `app/actions/llm-keys.ts`**
- Add `updateDefaultLlmMode(mode: 'own_key' | 'platform_credits')` — updates user preference
- Add `getDefaultLlmMode()` — returns current preference

**Modify: `app/actions/templates.ts` — `generateTemplate` function**
- Accept `usePlatformCredits: boolean` parameter
- If `true`: verify user has remaining credits via `getMyCredits()`, call LLM with platform AWS credentials from env vars, log usage with `provider: 'platform'`
- If `false`: use user's existing LLM key record (current behavior), log usage with `provider: keyRecord.provider`
- The branching logic happens at the single seam of the `generateTemplate` function, which already orchestrates the LLM call

### LLM Integration

**Modify: `lib/llm.ts`**
- Add `callLlmWithPlatformCredentials(prompt: string)` — reads `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from environment variables, calls Bedrock with the same logic as `callBedrock()` but using platform credentials
- Refactor existing `callBedrock()` to accept credentials as a parameter (or extract a shared helper) to avoid duplication
- The platform model and region are configurable via env vars (e.g., `PLATFORM_LLM_MODEL`, `PLATFORM_LLM_REGION`) with sensible defaults (`minimax.minimax-m2.5`, `us-east-1`)

### UI Components

**New: `components/promo-code-form.tsx`**
- Text input for promo code + "Redeem" button
- Calls `redeemPromoCode()` server action
- Shows success message with generations granted, or error message
- Triggers revalidation of credits display

**New: `components/llm-preference-toggle.tsx`**
- Radio toggle: "Use my own API key" / "Use platform credits (X remaining)"
- Shows remaining generations count when platform mode is selected
- Disabled state with helper text when no credits and no key available
- Calls `updateDefaultLlmMode()` on change

**New: `components/admin-promo-codes.tsx`**
- Form: code name input, generations number input, expiry date picker
- Table listing all codes with columns: code, generations, expires_at, redemption count
- Calls `createPromoCode()` and `getPromoCodes()`

**Modify: `app/(app)/settings/page.tsx`**
- Add "LLM Preference" section with `LlmPreferenceToggle`
- Add "Promo Code" section with `PromoCodeForm`
- Fetch user's default LLM mode and credits count server-side

**Modify: `components/new-template-form.tsx`**
- Accept additional prop: `{ hasLlmKey: boolean, defaultLlmMode: 'own_key' | 'platform_credits', platformCreditsRemaining: number }`
- On "Generate with AI" click:
  - If `defaultLlmMode === 'platform_credits'` and `platformCreditsRemaining > 0`: proceed with `usePlatformCredits: true`
  - If `defaultLlmMode === 'own_key'` and `hasLlmKey`: proceed with `usePlatformCredits: false`
  - If no credits and no key: show prompt to add key or redeem code
- Per-generation override: after clicking Generate, if user has both key and credits, show a small inline toggle to switch before confirming

**New: `app/(app)/admin/promo-codes/page.tsx`**
- Admin page rendering `AdminPromoCodes` component
- Route protected by admin check (env var `ADMIN_EMAILS`)

### Admin Access Control

Admin page access is gated by checking the authenticated user's email against a comma-separated `ADMIN_EMAILS` environment variable. If the env var is not set or the user's email is not in the list, redirect to dashboard.

### Implementation Order

1. Database schema (Drizzle schema additions + manual SQL migration)
2. Platform LLM credentials (`lib/llm.ts`)
3. LLM preference server actions (`app/actions/llm-keys.ts`)
4. Promo code server actions (`app/actions/promo-codes.ts`)
5. Admin server actions (`app/actions/admin.ts`)
6. Modify `generateTemplate` to support both modes
7. Settings UI (promo code form + preference toggle)
8. Generate flow UI (preference check + credit validation)
9. Admin page for promo codes
10. End-to-end testing

## Testing Decisions

### Testing Approach

Tests should verify external behavior (correct responses, correct DB state) rather than internal implementation details. The existing test file (`__tests__/template-generation.test.ts`) uses raw assertions without a test framework — new tests should follow the same pattern for consistency.

### Key Test Scenarios

- Redemption with valid, unexpired, unredeemed code succeeds and returns remaining count
- Redemption with expired/already-redeemed/nonexistent code throws error
- `getMyCredits` correctly computes remaining across multiple redemptions and usage
- Default LLM preference is `own_key` for new users, updates correctly
- `generateTemplate` with `usePlatformCredits: true` and sufficient credits succeeds and logs usage
- `generateTemplate` with `usePlatformCredits: true` and zero credits throws error
- Usage log entry is created for both platform and own-key generations
- `callLlmWithPlatformCredentials` succeeds with valid env vars, throws when missing
- Admin creating duplicate code name throws error; listing codes includes redemption counts

### Prior Art

Existing test file: `__tests__/template-generation.test.ts` — tests LLM JSON parsing and Bedrock connectivity using raw `console.log` assertions.

## Out of Scope

- Payment integration (Stripe, etc.)
- Rate limiting on redemption or generation
- Referral system or automatic code generation
- Per-generation credit costing (different models costing different amounts)
- Bulk code generation (e.g., 1000 unique single-use codes)
- Credit transfer between users
- Real-time credit updates via WebSockets
- Credit expiry notifications

## Further Notes

- The `llm_usage_log` table is feature-agnostic. Future LLM features should log to the same table with a different `feature` value.
- Platform AWS credentials are in environment variables (not database) since they are shared and operator-managed.
- Promo codes are case-insensitive on input (uppercased before lookup) but stored uppercase for consistency.
- The `ADMIN_EMAILS` env var approach is intentionally simple; can be upgraded to role-based access later.
