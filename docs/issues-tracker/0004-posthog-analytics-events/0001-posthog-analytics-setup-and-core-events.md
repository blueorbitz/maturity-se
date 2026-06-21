# Issue 1: PostHog Analytics Setup and Core Events

## What to build

Integrate PostHog cloud analytics into the application. Install the SDK, create a provider, add page view tracking, identify logged-in users, and instrument 12 custom events across the app's key user flows. Vercel Analytics remains alongside PostHog.

## Acceptance criteria

### SDK and Provider
- [ ] `posthog-js` is installed as a production dependency
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` env vars are documented in `.env.example`
- [ ] `PostHogProvider` component exists at `components/posthog-provider.tsx`
- [ ] Provider is `"use client"` and initializes `posthog.init()` with env vars
- [ ] Provider sets `debug: true` when `NODE_ENV === 'development'`
- [ ] Provider gracefully handles missing API key (no-op, no errors)
- [ ] Provider exports `usePostHog` hook via React context
- [ ] Root layout (`app/layout.tsx`) wraps `{children}` with `<PostHogProvider>`
- [ ] Vercel Analytics `<Analytics />` remains in root layout alongside PostHog

### Page View Tracking
- [ ] `PostHogPageView` component exists at `components/posthog-pageview.tsx`
- [ ] Component is `"use client"` and uses `usePathname()` and `useSearchParams()`
- [ ] Component fires `posthog.capture('$pageview')` on route changes
- [ ] Component is rendered inside `PostHogProvider` in root layout

### User Identification
- [ ] Auth-gated layout (`app/(app)/layout.tsx`) calls `posthog.identify()` after session confirmation
- [ ] `identify` is called with `userId` and person properties: `created_at`, `user_id`
- [ ] No PII (email, name) is sent to PostHog
- [ ] Sign-out flow calls `posthog.reset()`

### Custom Events
- [ ] `sign_up` event fired from `components/auth-form.tsx` on successful registration
- [ ] `sign_in` event fired from `components/auth-form.tsx` on successful login
- [ ] `template_created` event fired from `components/new-template-form.tsx` on template creation
- [ ] `template_ai_generated` event fired from `components/new-template-form.tsx` with `prompt_length` property
- [ ] `template_visibility_changed` event fired from `components/template-editor.tsx` or `components/template-editor-page.tsx` with `from` and `to` properties
- [ ] `assessment_created` event fired from `components/new-assessment-form.tsx` on assessment creation
- [ ] `assessment_status_changed` event fired from `components/assessment-status-control.tsx` with `from` and `to` properties
- [ ] `response_submitted` event fired from `components/respond-form.tsx` with `template_id` property
- [ ] `gallery_template_cloned` event fired from `components/gallery-client.tsx` with `template_id` property
- [ ] `promo_code_redeemed` event fired from `components/promo-code-form.tsx` with `code` property
- [ ] `llm_provider_added` event fired from `components/settings-client.tsx` with `provider` property
- [ ] `llm_provider_updated` event fired from `components/settings-client.tsx` with `provider` property

### Quality
- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm build` passes with no type errors

## Blocked by

None — can start immediately
