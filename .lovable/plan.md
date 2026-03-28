

## Fix Credit Deduction & Build Credit UX System

### Current Problem
Credits are deducted **client-side only** via `SubscriptionContext.useCredits()` which calls `supabase.rpc('update_user_credits')`. The `chat` edge function does **zero** server-side credit checking or deduction. A user can bypass deduction entirely by modifying client code.

### Architecture Overview

```text
Current:  Client → chat edge fn → AI → response → Client deducts credits (unreliable)
Proposed: Client → chat edge fn → check credits → AI → deduct credits → response (with remaining count)
```

---

### Part 1 — Server-Side Credit Deduction (Critical Fix)

**Database migration:** Create a `SECURITY DEFINER` function `deduct_user_credit` that:
- Accepts `p_user_id uuid` and `p_cost integer`
- Checks daily/monthly pools with auto-reset logic (new day resets daily, new month resets monthly)
- Deducts from daily pool first, then monthly pool
- Returns JSON: `{ success, credits_remaining, daily_remaining, monthly_remaining, tier, error? }`

**Edge function (`chat/index.ts`):** After successful AI response (line ~656):
- Create a service-role admin client
- Call `deduct_user_credit(userId, cost)` where cost is derived from the mode
- Include `credits_remaining` in the response payload
- If credits exhausted pre-check fails, return `{ error: "credits_exhausted", tier }` with status 402
- Never block the response if deduction fails post-AI-call — log and return response anyway

**Client (`SubscriptionContext.tsx`):** Keep `useCredits` for optimistic UI updates, but treat the server response as source of truth. After each AI call, sync `creditsRef` with the server-returned `credits_remaining`.

---

### Part 2 — CreditBadge Component

New file: `src/components/CreditBadge.tsx`

- Reads from `useSubscription()` context (already has `getCredits()`)
- **Desktop**: Shows `⚡ 47 credits` badge in header
- **Mobile**: Shows `⚡` icon only; full details in popover
- Color logic: green (>20%), amber+pulse (<20%), red (0)
- Clicking opens a Popover with: plan name, credits remaining, reset date, upgrade button
- Placed in `MobileHeader.tsx` (right side, before profile button)

---

### Part 3 — Credit Exhaustion Modal

New file: `src/components/CreditExhaustionModal.tsx`

- Triggered when `useCredits` returns false or server returns `credits_exhausted`
- Content adapts to current tier (Free vs Plus)
- Shows progress bar at 0%, social proof line, upgrade CTA
- Dismissible, shown max once per session (`sessionStorage`)
- Primary CTA navigates to `/subscription`

Integration: In `Index.tsx`, replace `showUpgradePrompt('Ask a Question')` with opening this modal.

---

### Part 4 — Milestone Toast Notifications

Modify `Index.tsx` `handleSubmit`: after each successful mode response, check total remaining credits against tier limits. Show sonner toasts at 50%, 20%, 10% thresholds. Track shown milestones in `sessionStorage` key `minimind-credit-milestones`.

---

### Part 5 — Credit History Section

New file: `src/components/CreditHistory.tsx`

- Query `usage_logs` grouped by day for last 30 days
- Show table: Date | Queries | Credits Used
- Show total used this period, remaining, next refill countdown
- Add to `SubscriptionPage.tsx` as a new section

---

### Files Changed

| File | Change |
|------|--------|
| **DB migration** | Create `deduct_user_credit(uuid, int)` function |
| `supabase/functions/chat/index.ts` | Add pre-check + post-deduction with service-role client; return `credits_remaining` in response |
| `src/components/CreditBadge.tsx` | **New** — persistent credit counter |
| `src/components/CreditExhaustionModal.tsx` | **New** — conversion modal at 0 credits |
| `src/components/CreditHistory.tsx` | **New** — usage transparency table |
| `src/components/MobileHeader.tsx` | Add CreditBadge to header |
| `src/contexts/SubscriptionContext.tsx` | Sync credits from server response; expose `syncCreditsFromServer` method |
| `src/pages/Index.tsx` | Use CreditExhaustionModal; add milestone toast logic; sync credits from AI response |
| `src/components/pages/SubscriptionPage.tsx` | Add CreditHistory section |

