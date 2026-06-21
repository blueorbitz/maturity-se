# Issue 3: Admin Promo Code Management

## What to build

Provide an admin interface for creating and viewing promo codes. The operator can create new codes with a name, generation count, and expiry date, and see a list of all codes with their redemption counts.

This slice adds: admin server actions for code creation and listing, and an admin page with a create form and codes table. Access is restricted to emails listed in the `ADMIN_EMAILS` environment variable.

## Acceptance criteria

- [ ] `createPromoCode(code, generations, expiresAt)` server action creates a new promo code; throws if code name already exists (case-insensitive check)
- [ ] `getPromoCodes()` server action returns all codes with columns: `id`, `code`, `generations`, `expires_at`, `created_at`, `redemptionCount` (left-joined from redemptions)
- [ ] Admin page exists at `/admin/promo-codes` with a form to create codes (fields: code name, generations, expiry date)
- [ ] Admin page displays a table listing all codes with columns: Code, Generations, Expires, Redemptions
- [ ] Admin page is protected: only users whose email is in the `ADMIN_EMAILS` env var (comma-separated) can access; others are redirected to dashboard
- [ ] If `ADMIN_EMAILS` env var is not set, the admin page is inaccessible (redirect)
- [ ] After creating a code, the table refreshes to show the new code
- [ ] Form validation: code name required, generations must be positive integer, expiry date required and must be in the future

## Blocked by

- Issue 1: Promo Code Redemption Flow (needs `promo_codes` table to exist)
