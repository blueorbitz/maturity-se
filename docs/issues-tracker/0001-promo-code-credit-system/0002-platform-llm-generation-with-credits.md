# Issue 2: Platform LLM Generation with Credits

## What to build

Enable users to generate templates using platform-provided LLM credits instead of their own API key. Add a preference toggle in Settings, modify the template generation flow to support platform credentials, and log every LLM usage for audit and credit deduction.

This slice adds: the `llm_usage_log` table, platform LLM credential handling via environment variables, a user preference for default LLM mode, and the branching logic in `generateTemplate` that checks credits and calls the appropriate LLM.

## Acceptance criteria

- [ ] `llm_usage_log` table exists with columns: `id`, `user_id`, `feature` (default `'template_generation'`), `provider`, `model`, `created_at`
- [ ] `user` table has `default_llm_mode` column (default `'own_key'`, values: `'own_key'` or `'platform_credits'`)
- [ ] `callLlmWithPlatformCredentials(prompt)` function reads `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from environment variables and calls Bedrock; throws if env vars are missing
- [ ] `callLlmWithPlatformCredentials` uses configurable model via `PLATFORM_LLM_MODEL` env var (default: `minimax.minimax-m2.5`) and region via `PLATFORM_LLM_REGION` env var (default: `us-east-1`)
- [ ] `updateDefaultLlmMode(mode)` server action updates the user's `default_llm_mode` preference
- [ ] `getDefaultLlmMode()` server action returns the user's current preference
- [ ] `generateTemplate` accepts `usePlatformCredits: boolean` parameter
- [ ] When `usePlatformCredits: true`, `generateTemplate` checks user has remaining credits before calling LLM; throws if zero credits
- [ ] When `usePlatformCredits: true`, `generateTemplate` calls `callLlmWithPlatformCredentials` and logs usage with `provider: 'platform'`
- [ ] When `usePlatformCredits: false`, `generateTemplate` uses user's own key (existing behavior) and logs usage with `provider: keyRecord.provider`
- [ ] Every LLM call (platform or own key) creates a log entry in `llm_usage_log`
- [ ] Settings page shows LLM preference toggle: "Use my own API key" / "Use platform credits (X remaining)"
- [ ] Credits remaining count is displayed next to the platform credits option
- [ ] When user has no credits and no key, both options are disabled with helper text prompting to add key or redeem code
- [ ] Preference change takes effect immediately (no page refresh needed)

## Blocked by

- Issue 1: Promo Code Redemption Flow (needs promo code tables and `getMyCredits` to exist)
