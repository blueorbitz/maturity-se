# Issue 1: Promo Code Redemption Flow

## What to build

Implement the core promo code redemption system. A user can enter a promo code in the Settings page, the system validates it (exists, not expired, not already redeemed), and grants them a number of platform LLM generations. The user can see their remaining credits displayed in Settings.

This slice covers: database schema for promo codes and redemptions, server actions for redemption and credit calculation, and the Settings UI for entering codes and viewing credits.

## Acceptance criteria

- [ ] `promo_codes` table exists with columns: `id`, `code` (unique, uppercase), `generations`, `expires_at`, `created_at`
- [ ] `promo_code_redemptions` table exists with columns: `id`, `user_id`, `promo_code_id`, `redeemed_at`, with unique constraint on `(user_id, promo_code_id)`
- [ ] `redeemPromoCode(code)` server action validates code exists, is not expired, and has not been redeemed by the current user; throws descriptive errors for each failure case
- [ ] `redeemPromoCode` returns `{ success: true, generationsGranted: number, remaining: number }` on success
- [ ] `getMyCredits()` server action returns `{ totalGranted: number, used: number, remaining: number }` by summing all redemption grants and counting platform usage log entries
- [ ] `getMyCredits` returns `{ totalGranted: 0, used: 0, remaining: 0 }` when user has no redemptions
- [ ] Promo codes are case-insensitive on input (uppercased before lookup)
- [ ] Settings page displays a "Promo Code" section with text input and "Redeem" button
- [ ] After successful redemption, the credits display updates to show the new remaining count
- [ ] Error messages are shown for: code not found, code expired, already redeemed by this user
- [ ] Admin can create test codes via direct SQL insertion

## Blocked by

None — can start immediately
