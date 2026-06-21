# PRD: User Usage Log Page

## Problem Statement

Users have no visibility into their LLM API usage. While the Settings page shows remaining platform credits, there is no way to see a detailed history of when LLM calls were made, which provider was used, or which feature triggered them. Users cannot track their consumption patterns, verify unexpected usage, or understand their usage trends over time.

## Solution

Add a dedicated `/usage` page that displays a paginated, filterable table of the user's LLM usage logs. Each row shows the feature, provider, model (when applicable), and timestamp of each LLM call. Users can filter by date range (7 days, 30 days, or all time) and load more results on demand.

## User Stories

1. As a logged-in user, I want to navigate to a "Usage" page from the sidebar, so that I can view my LLM usage history.
2. As a user, I want to see a table of my usage logs showing feature, provider, model, and timestamp, so that I understand when and how my LLM calls were made.
3. As a user, I want the model column hidden when the provider is "platform", so that I only see relevant information for platform-provided calls.
4. As a user, I want to filter my usage logs by date range (Last 7 days, Last 30 days, All time), so that I can focus on recent activity.
5. As a user, I want the logs to load the most recent 20 entries by default, so that the page loads quickly.
6. As a user, I want a "Load more" button at the bottom of the table, so that I can see older entries without loading everything at once.
7. As a user, I want the filter to reset pagination when changed, so that I always see the most relevant results.
8. As a user, I want the usage page to require authentication, so that I can only see my own usage data.
9. As a user, I want to see an empty state message when I have no usage logs, so that I understand the page is working but I haven't used any LLM features yet.
10. As a user, I want the timestamps to be human-readable (e.g., "Jun 21, 2026 10:30 AM"), so that I can easily understand when calls were made.
11. As a user, I want the table to be sorted by most recent first, so that I see my latest activity immediately.
12. As a user, I want the "Load more" button to disappear when there are no more logs to load, so that I know I've seen everything.
13. As a user, I want the loading state to be clear when fetching more logs, so that I know the system is working.
14. As a user, I want the page to match the visual style of other pages in the app (Settings, Admin), so that the experience feels consistent.

## Implementation Decisions

### Database Schema

No schema changes needed. The existing `llm_usage_log` table already contains all required fields:
- `id` (text, primary key)
- `userId` (text, FK to user)
- `feature` (text, default `'template_generation'`)
- `provider` (text)
- `model` (text, nullable)
- `createdAt` (timestamp)

### Server Actions

**New file: `app/actions/usage.ts`**

- `getMyUsageLogs(options: { offset: number; limit: number; dateRange: '7d' | '30d' | 'all' })` — Auth-protected server action that queries `llm_usage_log` filtered by the current user and optional date range. Returns rows with `id`, `feature`, `provider`, `model`, `createdAt`. Ordered by `createdAt DESC`. Returns empty array if no logs exist.

- Date range filtering logic:
  - `'7d'`: `createdAt >= now() - 7 days`
  - `'30d'`: `createdAt >= now() - 30 days`
  - `'all'`: no date filter

### Page Component

**New file: `app/(app)/usage/page.tsx`**

- Server component with authentication check (redirect to `/sign-in` if not logged in)
- Fetches first 20 rows via `getMyUsageLogs` with `offset: 0, limit: 20, dateRange: 'all'`
- Passes data to client component

### Client Component

**New file: `components/usage-log.tsx`**

- `'use client'` component
- State: `logs` (array), `offset` (number), `hasMore` (boolean), `loading` (boolean), `dateRange` (string)
- Date range dropdown with options: "Last 7 days", "Last 30 days", "All time"
- Table with columns: Feature, Provider, Model, Timestamp
  - Model column is hidden when `provider === 'platform'`
  - Timestamps formatted using `date-fns` `format()` function
- "Load more" button at bottom, disabled while loading, hidden when `hasMore` is false
- On filter change: resets offset to 0, re-fetches first 20 logs, updates state
- On "Load more": increments offset by 20, appends new logs to existing list
- Empty state: "No usage logs yet" message when logs array is empty
- Loading state: "Loading..." text or spinner on the Load more button

### Sidebar Navigation

**Modify: `components/app-sidebar.tsx`**

- Add new nav item: `{ href: '/usage', label: 'Usage', icon: Activity }`
- Insert after "Reports" in the nav array
- Import `Activity` icon from `lucide-react`

### Implementation Order

1. Create `app/actions/usage.ts` with `getMyUsageLogs` server action
2. Create `components/usage-log.tsx` client component
3. Create `app/(app)/usage/page.tsx` server page
4. Modify `components/app-sidebar.tsx` to add sidebar link

## Testing Decisions

### Testing Approach

Tests should verify external behavior (correct data returned, correct filtering, correct pagination) rather than internal implementation details. Follow the existing test pattern in `__tests__/template-generation.test.ts` which uses raw assertions without a test framework.

### Key Test Scenarios

- `getMyUsageLogs` returns logs for the authenticated user only (not other users' logs)
- `getMyUsageLogs` with `dateRange: '7d'` returns only logs from the last 7 days
- `getMyUsageLogs` with `dateRange: '30d'` returns only logs from the last 30 days
- `getMyUsageLogs` with `dateRange: 'all'` returns all logs
- `getMyUsageLogs` respects `offset` and `limit` parameters
- `getMyUsageLogs` returns empty array for user with no logs
- Unauthenticated request throws or redirects

### Prior Art

Existing test file: `__tests__/template-generation.test.ts` — tests LLM JSON parsing and Bedrock connectivity using raw `console.log` assertions.

## Out of Scope

- Admin usage dashboard with weekly line chart (planned for future iteration)
- Real-time usage updates via WebSockets
- Export/download usage logs as CSV
- Usage statistics or summary cards
- Filtering by feature or provider (only date range for now)
- Cost calculation or billing integration
- Rate limiting based on usage

## Further Notes

- The `llm_usage_log` table is already being populated by `app/actions/templates.ts` when users generate templates with AI.
- The `provider` column can be `'platform'`, `'openai'`, or `'bedrock'` depending on which LLM mode the user selected.
- The `feature` column is currently always `'template_generation'` but the schema supports future features like `'report_analysis'` or `'assessment_insights'`.
- The page follows the same visual pattern as the Admin Promo Codes page: bordered header, max-width container, card-based layout.