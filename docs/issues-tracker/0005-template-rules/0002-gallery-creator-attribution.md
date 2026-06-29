## Parent

PRD: `docs/prd/0005-template-rules.md`

## What to build

Show the template creator's name in the public gallery, displayed beside the topic on each template card.

The `getPublicTemplates` server action joins with the `user` table to include the author's display name. The gallery cards render "· by {name}" after the topic. If the user has no name (empty string or null), the attribution is omitted — no email fallback.

This is a complete vertical slice: server query, type updates, UI rendering, and tests.

## Acceptance criteria

- [ ] `getPublicTemplates` joins `templates` with `user` on `userId` and returns `authorName` (the user's `name` field)
- [ ] When `user.name` is empty or null, `authorName` is returned as null
- [ ] `Template` type in `TemplateCard` includes optional `authorName?: string`
- [ ] `Template` type in `GalleryClient` includes optional `authorName?: string`
- [ ] In gallery cards, the topic line renders as "{topic} · by {authorName}" when `authorName` is truthy
- [ ] When `authorName` is null or empty, the topic line renders as just "{topic}" (no trailing punctuation)
- [ ] The "· by {name}" text uses the same styling as the topic (`text-xs text-muted-foreground`)
- [ ] Tests cover: server returns author name, server returns null for empty name, UI renders attribution when present, UI omits attribution when absent

## Blocked by

None — can start immediately
