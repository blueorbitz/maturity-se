## Parent

PRD: `docs/prd/0005-template-rules.md`

## What to build

Prevent cloned templates from being made public, enforced both server-side and in the UI.

When a user tries to toggle visibility on a cloned template, the server action `updateTemplateVisibility` rejects the request with an error message. In the UI, the "Make public" dropdown item in `TemplateCard` is greyed out and shows a tooltip explaining why.

This is a complete vertical slice: server action guard, UI feedback, and tests.

## Acceptance criteria

- [ ] `updateTemplateVisibility` throws an error ("Cloned templates cannot be made public") when the template's `clonedFromId` is not null
- [ ] `updateTemplateVisibility` still works normally for non-cloned templates
- [ ] In `TemplateCard`, when `showActions` is true and `clonedFromId` is set, the "Make public" menu item is disabled (reduced opacity, no click handler)
- [ ] The disabled "Make public" item has a `title` attribute tooltip: "Cloned templates cannot be made public"
- [ ] The "Make private" item remains enabled for cloned templates (no change)
- [ ] Tests cover: server action rejects cloned template, server action allows non-cloned template, UI renders disabled state

## Blocked by

None — can start immediately
