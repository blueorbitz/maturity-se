---
name: ui-component-patterns
description: Guidelines for creating UI components with @base-ui/react primitives. Use when working with Button, DropdownMenu, or other UI components to avoid common hydration errors and React warnings.
---

# UI Component Patterns

## Button Component

### ❌ Common Mistake - Destructuring `asChild` and ignoring it

```tsx
// WRONG - asChild gets passed to DOM element via {...props}
function Button({ asChild: _asChild, ...props }) {
  void _asChild; // intentionally unused
  return <ButtonPrimitive {...props} />;
}
```

**Error caused:** "React does not recognize the `asChild` prop on a DOM element"

### ✅ Correct Pattern

```tsx
function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

### Key Points

- Don't destructure `asChild` unless you're actually using it
- Let the primitive component from `@base-ui/react/button` handle its own `asChild` prop internally
- Only pass through props that the primitive expects

---

## Dropdown Menu Components

### ❌ Common Mistake - Nested `<button>` elements (hydration error)

```tsx
// WRONG - creates button inside button
<DropdownMenuTrigger>
  <Button>Menu</Button>
</DropdownMenuTrigger>
```

**Error caused:** `<button> cannot be a descendant of <button>` hydration error

### ✅ Correct Pattern

```tsx
function DropdownMenuTrigger({
  className,
  ...props
}: MenuPrimitive.Trigger.Props) {
  return (
    <MenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        className
      )}
      {...props}
    />
  );
}
```

### Usage Guidelines

- Don't wrap trigger content in a `<Button>` - the trigger already renders as a button
- Style the trigger directly with appropriate classes
- Always include proper focus-visible and disabled states

---

## General UI Component Rules

When working with UI components:

1. **Don't destructure and ignore props** - either use them or let them pass through
2. **Avoid nested interactive elements** - buttons inside buttons, links inside links
3. **Check primitive component APIs** - base-ui components often handle `asChild` internally
4. **Always test for hydration errors** - watch console for React warnings
5. **Include proper accessibility attributes** - focus states, aria attributes, keyboard navigation

## Tech Stack Context

- Using `@base-ui/react` primitives which handle `asChild` internally
- Using `class-variance-authority` for variant management
- Using `cn()` utility from `@/lib/utils` for class merging
- Tailwind CSS for styling with custom theme tokens

## Testing Requirements

Before committing UI component changes:

- Run `pnpm lint` 
- Check browser console for hydration errors
- Verify no React warnings about unrecognized DOM props
