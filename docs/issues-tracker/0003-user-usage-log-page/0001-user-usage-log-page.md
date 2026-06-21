# Issue 1: User Usage Log Page

## What to build

Implement a personal usage log page at `/usage` that displays a paginated, filterable table of the user's LLM usage history. Each row shows the feature, provider, model (when applicable), and timestamp of each LLM call. Users can filter by date range and load more results on demand.

This slice covers: server action for fetching paginated usage logs, client component with date range filter and pagination, server page with auth check, and sidebar navigation link.

## Acceptance criteria

- [ ] `getMyUsageLogs` server action exists in `app/actions/usage.ts`
- [ ] `getMyUsageLogs` requires authentication (throws if not logged in)
- [ ] `getMyUsageLogs` accepts `offset`, `limit`, and `dateRange` parameters
- [ ] `getMyUsageLogs` returns rows with `id`, `feature`, `provider`, `model`, `createdAt`
- [ ] `getMyUsageLogs` filters by `dateRange: '7d'` (last 7 days)
- [ ] `getMyUsageLogs` filters by `dateRange: '30d'` (last 30 days)
- [ ] `getMyUsageLogs` returns all logs when `dateRange: 'all'`
- [ ] `getMyUsageLogs` orders results by `createdAt DESC`
- [ ] `getMyUsageLogs` returns empty array for user with no logs
- [ ] `/usage` page exists at `app/(app)/usage/page.tsx`
- [ ] Page redirects to `/sign-in` if not authenticated
- [ ] Page fetches first 20 rows on initial load
- [ ] Client component `usage-log.tsx` exists
- [ ] Client component shows date range dropdown (Last 7 days, Last 30 days, All time)
- [ ] Client component shows table with columns: Feature, Provider, Model, Timestamp
- [ ] Model column is hidden when `provider === 'platform'`
- [ ] Timestamps are formatted using `date-fns` `format()`
- [ ] "Load more" button appears at bottom of table
- [ ] "Load more" loads next 20 rows and appends to existing list
- [ ] "Load more" is hidden when no more logs to load
- [ ] "Load more" shows loading state while fetching
- [ ] Changing date range resets pagination and re-fetches first 20 logs
- [ ] Empty state shows "No usage logs yet" message
- [ ] Sidebar shows "Usage" link with `Activity` icon
- [ ] Sidebar link appears after "Reports" in navigation
- [ ] Page follows visual style of Settings and Admin pages

## Blocked by

None — can start immediately