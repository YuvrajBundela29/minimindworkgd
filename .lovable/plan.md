
# Fix Credit Display and Deduction

## Problem
Credits show as "13 credits" (or 15) in the side menu and never decrease because:
1. The `useCredits()` function checks for a logged-in user and returns early (`if (!user) return false`) without deducting anything for non-authenticated users
2. Even for logged-in users, the local state update happens but the SideMenu reads `getRemainingQuestions()` which already works -- however the DB update may fail silently if the `user_subscriptions` row doesn't exist

## Solution
Make the credit system work for ALL users (logged in or not) by always updating local state first, and persisting to localStorage for non-authenticated users.

## Changes

### 1. `src/contexts/SubscriptionContext.tsx` -- Fix `useCredits` for non-auth users

**Current behavior (broken):**
- Line 323-324: `if (!user) return false` -- skips deduction entirely for guests

**New behavior:**
- Always update the local state (dailyUsed, monthlyUsed) regardless of auth status
- For logged-in users: also persist to the database (existing behavior)
- For non-logged-in users: persist to `localStorage` so credits survive page refreshes
- On mount, load credit usage from `localStorage` if no auth user exists

### 2. `src/contexts/SubscriptionContext.tsx` -- Load saved credits from localStorage

- In the `refreshSubscription` function, when no user is found (line 196-212), check `localStorage` for saved credit state (daily used count and last reset date)
- If the saved date is today, restore the dailyUsed count; otherwise start fresh (daily reset)

### 3. `src/components/SideMenu.tsx` -- Use `getCredits()` for live total

- Replace `getRemainingQuestions()` with `getCredits().total` to show the real-time remaining credit count
- This ensures the displayed number updates immediately after any credit deduction

## Files to Modify
1. `src/contexts/SubscriptionContext.tsx` -- local credit tracking for guests + always update state
2. `src/components/SideMenu.tsx` -- show live credit total
