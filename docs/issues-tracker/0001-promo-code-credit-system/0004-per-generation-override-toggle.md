# Issue 4: Per-Generation Override Toggle

## What to build

Allow users to override their default LLM preference on a per-generation basis. When a user has both a saved API key and platform credits available, show an inline toggle in the template generation flow so they can choose which method to use for that specific generation.

This slice modifies the template generation UI to support the override and improves error messages when neither credits nor a key are available.

## Acceptance criteria

- [ ] When user clicks "Generate with AI" and has both a saved key and platform credits, a small inline toggle appears before confirmation: "Use my key" / "Use platform credits"
- [ ] The toggle defaults to the user's saved preference (`default_llm_mode`)
- [ ] Clicking "Generate with AI" with the toggle set to "Use platform credits" passes `usePlatformCredits: true` to the server action
- [ ] Clicking "Generate with AI" with the toggle set to "Use my key" passes `usePlatformCredits: false` to the server action
- [ ] When user has only a key (no credits), generation proceeds with own key immediately (no toggle shown)
- [ ] When user has only credits (no key), generation proceeds with platform credits immediately (no toggle shown)
- [ ] When user has neither credits nor key, a clear message is shown: "Add an LLM key in Settings or redeem a promo code to generate templates with AI" with links to both
- [ ] The "Generate with AI" button is disabled with the helper message when neither option is available
- [ ] After generation completes, the credits remaining count updates (if platform credits were used)

## Blocked by

- Issue 2: Platform LLM Generation with Credits (needs `usePlatformCredits` parameter and platform LLM integration)
