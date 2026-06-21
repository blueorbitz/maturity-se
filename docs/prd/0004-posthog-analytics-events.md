## Problem Statement

The application has no user behavior analytics beyond Vercel's page-level metrics. There is no visibility into which features users adopt, how they move through the product, or where they drop off. Without this data, product decisions are guesswork.

## Solution

Integrate PostHog (cloud, US region) for client-side event tracking. Add a PostHog provider to the app root, track 12 custom events across key user flows, identify logged-in users, and capture accurate page views via Next.js route change detection. Vercel Analytics remains in place alongside PostHog.

## User Stories

1. As a product owner, I want to see how many users sign up each day, so that I can track growth.
2. As a product owner, I want to see how many users sign in each day, so that I can measure retention.
3. As a product owner, I want to track how many templates are created, so that I can measure core feature adoption.
4. As a product owner, I want to know how often the AI template generation feature is used, so that I can justify the LLM cost.
5. As a product owner, I want to see how many assessments are created, so that I can measure the primary workflow usage.
6. As a product owner, I want to track assessment status changes, so that I can understand how assessments flow through their lifecycle.
7. As a product owner, I want to know how many responses are submitted to assessments, so that I can measure end-user engagement.
8. As a product owner, I want to track when templates are cloned from the gallery, so that I can see which templates are popular.
9. As a product owner, I want to track promo code redemptions, so that I can measure referral effectiveness.
10. As a product owner, I want to know when users add or update LLM providers, so that I can understand AI feature onboarding.
11. As a product owner, I want to track template visibility changes (draft to published), so that I can see content publishing patterns.
12. As a product owner, I want accurate page view counts per route, so that I can see which pages are most visited.
13. As a product owner, I want to see per-user event history, so that I can understand individual user behavior.
14. As a product owner, I want to filter events by user signup date, so that I can cohort users by tenure.
15. As a developer, I want PostHog debug logging in development, so that I can verify events fire correctly without leaving the browser console.
16. As a developer, I want events to be non-PII, so that we remain privacy-compliant.
17. As a developer, I want PostHog to initialize gracefully when the API key is missing, so that the app doesn't break in environments without analytics configured.
18. As a developer, I want page view tracking to work with Next.js App Router client-side navigation, so that SPA route changes are counted as page views.
19. As a user, I want my actions to be tracked anonymously until I log in, so that my experience is not degraded.
20. As a product owner, I want to see event counts over time in PostHog dashboards, so that I can spot trends.

## Implementation Decisions

### PostHog SDK
- Install `posthog-js` only (no `posthog-node`). Client-side tracking exclusively.
- Initialize via `posthog.init()` with env vars `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` (`https://us.i.posthog.com`).
- Set `debug: true` when `NODE_ENV === 'development'`.
- If the API key env var is missing, PostHog initializes in a no-op state (no errors thrown).

### Provider Architecture
- Create a `"use client"` PostHog provider component that wraps the app via React context.
- The provider is placed in the root layout (`app/layout.tsx`), wrapping `{children}`.
- A `PostHogPageView` component lives inside the provider, listening to `usePathname()` and `useSearchParams()` to fire `$pageview` on each route change.
- Vercel Analytics (`<Analytics />`) remains in the root layout alongside the PostHog provider. They coexist without conflict.

### User Identification
- In the auth-gated layout (`app/(app)/layout.tsx`), after confirming the session, call `posthog.identify(userId)` with person properties: `created_at`, `user_id`.
- On sign-out, call `posthog.reset()`.
- No PII (email, name) is sent to PostHog.

### Event Schema

| Event Name | Trigger Component | Properties |
|---|---|---|
| `$pageview` | `PostHogPageView` (auto) | `$current_url`, `$pathname` |
| `sign_up` | `auth-form.tsx` | — |
| `sign_in` | `auth-form.tsx` | — |
| `template_created` | `new-template-form.tsx` | — |
| `template_ai_generated` | `new-template-form.tsx` | `prompt_length` |
| `template_visibility_changed` | `template-editor.tsx` or `template-editor-page.tsx` | `from`, `to` |
| `assessment_created` | `new-assessment-form.tsx` | — |
| `assessment_status_changed` | `assessment-status-control.tsx` | `from`, `to` |
| `response_submitted` | `respond-form.tsx` | `template_id` |
| `gallery_template_cloned` | `gallery-client.tsx` | `template_id` |
| `promo_code_redeemed` | `promo-code-form.tsx` | `code` |
| `llm_provider_added` | `settings-client.tsx` | `provider` |
| `llm_provider_updated` | `settings-client.tsx` | `provider` |

### Environment Variables
- `NEXT_PUBLIC_POSTHOG_KEY` — PostHog project API key (`phc_...`)
- `NEXT_PUBLIC_POSTHOG_HOST` — `https://us.i.posthog.com`
- Both set in `.env.development.local` (local dev) and production env (Vercel).

## Testing Decisions

- The primary test seam is the PostHog provider: mock `posthog-js` and verify `init` is called with correct config.
- Each component that fires an event can be tested by mocking `posthog-js` and asserting `capture` was called with the correct event name and properties.
- The `PostHogPageView` component can be tested by mocking `next/navigation` hooks (`usePathname`, `useSearchParams`) and verifying `$pageview` fires on route changes.
- User identification can be tested by mocking the session and verifying `identify` is called with the correct userId and properties.
- Existing test patterns in the codebase should be followed (if any). No new test framework is introduced.

## Out of Scope

- Server-side event tracking (PostHog Node SDK in server actions).
- PostHog feature flags or experiments.
- PostHog session recording.
- PostHog surveys or feedback widgets.
- Replacing Vercel Analytics.
- Sending PII (email, name) to PostHog.
- Custom dashboards or reports in PostHog (post-implementation configuration, not code).

## Further Notes

- PostHog's free plan has a 1 million events/month limit. The event volume for this app should be well within that.
- The `posthog-js` SDK handles batching and retry logic internally — no custom transport needed.
- PostHog auto-captures `$pageview`, `$pageleave`, and autocapture (clicks on interactive elements) by default. The custom events in this PRD supplement those defaults.
- The `PostHogPageView` component is necessary because Next.js App Router does not trigger full page loads on client-side navigation, which PostHog's auto-capture relies on.
