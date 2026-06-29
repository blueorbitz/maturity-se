## Problem Statement

The template system has two gaps in its rules and metadata:

1. **Cloned templates can be made public.** A user clones a public template, and the "Make Public" toggle is fully available. This means derivative copies can be republished to the gallery, creating duplicate/near-duplicate templates that clutter the public gallery and dilute the value of original contributions.

2. **Public gallery cards don't show who created the template.** When browsing the gallery, users see title, topic, domain count, and recency — but no author attribution. There is no way to know who shared a template without clicking into it.

## Solution

Add two rules and one metadata display change:

1. **Block cloned templates from being made public** — enforced server-side (the `updateTemplateVisibility` action rejects the toggle) and in the UI (the "Make Public" option is greyed out with an explanatory tooltip).

2. **Show the template creator's name in the public gallery** — join the `templates` query with the `user` table, and display "by {name}" beside the topic line on gallery cards. If the user has no name set, the attribution is omitted (no email fallback).

## User Stories

1. As a template author, I want cloned templates to be permanently private, so that the public gallery is not flooded with derivative copies.
2. As a template author, I want to see a clear signal in the UI that I cannot make a cloned template public, so that I don't waste time trying.
3. As a gallery browser, I want to see the author's name on each template card, so that I can identify who shared it.
4. As a gallery browser, I want the author name to appear beside the topic, so that the card layout remains compact.
5. As a gallery browser, I want the author attribution to be omitted when the user has no display name, so that I don't see "by " with nothing after it.
6. As a template owner, I want the server to reject any attempt to make a cloned template public, so that the rule is enforced regardless of UI manipulation.
7. As a developer, I want the cloned-template restriction to be enforced at the highest seam (the server action), so that all client paths are covered.
8. As a gallery browser, I want to see "by {name}" only — not the original creator of the source template — so that the attribution reflects who chose to share it.

## Implementation Decisions

### Server-side enforcement — `updateTemplateVisibility`
- Before executing the update, query the template to read `clonedFromId`.
- If `clonedFromId` is not null, throw an error: `"Cloned templates cannot be made public"`.
- This is the authoritative guard — all client-side behaviour is cosmetic.

### UI enforcement — `TemplateCard`
- When `showActions` is true and `clonedFromId` is set, the "Make public" dropdown item is rendered but disabled (`pointer-events-none`, reduced opacity).
- A `title` attribute (native tooltip) on the disabled item reads: `"Cloned templates cannot be made public"`.
- The "Make private" item remains enabled (a cloned template that is already private has no meaningful action, but disabling it would require additional state — not worth the complexity).

### Gallery author attribution — `getPublicTemplates`
- Join `templates` with `user` on `templates.userId = user.id`.
- Select `user.name` as `authorName`.
- The return type of `getPublicTemplates` gains an optional `authorName: string | null` field.
- No join on `clonedFromId` — only the current owner is attributed.

### Template type updates
- `TemplateCard` and `GalleryClient` both define an inline `Template` type. Add `authorName?: string` to both.
- The gallery page passes the enriched data through from the server action.

### Display format
- Topic line changes from `{topic}` to `{topic} · by {authorName}` when `authorName` is truthy.
- When `authorName` is null or empty, the line remains just `{topic}`.
- The "· by ..." text uses the same `text-xs text-muted-foreground` styling as the topic.

## Testing Decisions

- **Server-side guard**: Test `updateTemplateVisibility` by calling it with a cloned template ID — expect the error to be thrown. Test with a non-cloned template — expect the update to succeed. This tests external behaviour (error vs success) not implementation details.
- **UI grey-out**: Test that `TemplateCard` renders the "Make public" item as disabled when `clonedFromId` is set, and enabled otherwise. This can be a snapshot or behaviour test depending on existing patterns.
- **Author attribution**: Test `getPublicTemplates` returns `authorName` when a user has a name, and `null` when the name is empty. Verify the join doesn't break the query.
- **Gallery display**: Test that `GalleryClient` renders "by {name}" when `authorName` is present, and omits it when absent.
- Prior art: existing tests in `__tests__/template-generation.test.ts` — follow similar patterns (unit tests against server actions or components).

## Out of Scope

- Chasing clone chains (showing "cloned from Alice" or linking to the original template).
- Allowing template authors to see who cloned their template.
- Moderation or approval flow for publishing templates to the gallery.
- Bulk operations on cloned templates (e.g. "delete all clones").
- Schema changes — no new columns or tables are needed.
- Changing the clone behavior itself (cloned templates remain private by default).

## Further Notes

- Existing data: there may be templates in the database that were cloned and then made public before this rule existed. These templates will remain public — the new rule only prevents future toggles. A one-time data migration to set those templates back to private is not included but could be done separately if desired.
- The `user.name` column is `NOT NULL` in the schema, but could contain empty strings. The UI should treat empty string the same as null (omit attribution).
