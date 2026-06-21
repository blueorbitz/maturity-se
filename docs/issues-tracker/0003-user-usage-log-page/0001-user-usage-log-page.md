# Issue 1: User Usage Log Page

## What to build

Implement a personal usage log page at `/usage` that displays a paginated, filterable table of the user's LLM usage history. Each row shows the feature, provider, model (when applicable), and timestamp of each LLM call. Users can filter by date range and load more results on demand.

This slice covers: server action for fetching paginated usage logs, client component with date range filter and pagination, server page with auth check, and sidebar navigation link.

## Acceptance criteria

- [x] `getMyUsageLogs` server action exists in `app/actions/usage.ts`
- [x] `getMyUsageLogs` requires authentication (throws if not logged in)
- [x] `getMyUsageLogs` accepts `offset`, `limit`, and `dateRange` parameters
- [x] `getMyUsageLogs` returns rows with `id`, `feature`, `provider`, `model`, `createdAt`
- [x] `getMyUsageLogs` filters by `dateRange: '7d'` (last 7 days)
- [x] `getMyUsageLogs` filters by `dateRange: '30d'` (last 30 days)
- [x] `getMyUsageLogs` returns all logs when `dateRange: 'all'`
- [x] `getMyUsageLogs` orders results by `createdAt DESC`
- [x] `getMyUsageLogs` returns empty array for user with no logs
- [x] `/usage` page exists at `app/(app)/usage/page.tsx`
- [x] Page redirects to `/sign-in` if not authenticated
- [x] Page fetches first 20 rows on initial load
- [x] Client component `usage-log.tsx` exists
- [x] Client component shows date range dropdown (Last 7 days, Last 30 days, All time)
- [x] Client component shows table with columns: Feature, Provider, Model, Timestamp
- [x] Model column is hidden when `provider === 'platform'`
- [x] Timestamps are formatted using `date-fns` `format()`
- [x] "Load more" button appears at bottom of table
- [x] "Load more" loads next 20 rows and appends to existing list
- [x] "Load more" is hidden when no more logs to load
- [x] "Load more" shows loading state while fetching
- [x] Changing date range resets pagination and re-fetches first 20 logs
- [x] Empty state shows "No usage logs yet" message
- [x] Sidebar shows "Usage" link with `Activity` icon
- [x] Sidebar link appears after "Reports" in navigation
- [x] Page follows visual style of Settings and Admin pages

## Blocked by

None — can start immediately