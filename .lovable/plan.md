
# Fix Subscription System: Remove Demo Pro Status & Add Database-Backed Subscriptions

## Problem Identified
You're seeing the "Pro Dashboard" because the demo `upgradeToPro()` function previously saved `'pro'` to localStorage. The current system incorrectly persists this fake Pro status.

## Solution Overview
1. Create a proper `user_subscriptions` database table to track subscription status
2. Update the SubscriptionContext to read from the database (not just localStorage)
3. Remove the demo auto-upgrade behavior
4. Add a "Reset to Free" developer option temporarily for testing
5. Prepare the architecture for Razorpay webhook integration

---

## Part 1: Database Schema

Create a new `user_subscriptions` table:

```text
user_subscriptions
├── id (uuid, primary key)
├── user_id (uuid, references profiles)
├── tier ('free' | 'pro')
├── plan_type ('monthly' | 'yearly' | null)
├── razorpay_subscription_id (text, for payment verification)
├── razorpay_customer_id (text)
├── current_period_start (timestamp)
├── current_period_end (timestamp)
├── status ('active' | 'cancelled' | 'expired' | 'pending')
├── credits_daily_used (integer, default 0)
├── credits_monthly_used (integer, default 0)
├── credits_last_daily_reset (date)
├── credits_last_monthly_reset (date)
├── created_at (timestamp)
├── updated_at (timestamp)
```

RLS Policies:
- Users can read their own subscription
- Only backend/edge functions can update subscription status (for payment security)

---

## Part 2: Updated SubscriptionContext

Changes to `src/contexts/SubscriptionContext.tsx`:
- On load, fetch subscription from database (if user is logged in)
- Fall back to 'free' tier if no subscription record exists
- Remove localStorage tier persistence (credits can still use localStorage for offline support)
- Remove the demo `upgradeToPro()` instant upgrade behavior
- `upgradeToPro()` will now only work after Razorpay payment confirmation

---

## Part 3: Subscription Page Updates

Changes to `src/components/pages/SubscriptionPage.tsx`:
- Show accurate Free/Pro status based on database
- "Upgrade" button triggers Razorpay checkout (placeholder ready for your integration)
- Pro users see actual billing dates from database
- Add "Manage Subscription" for Pro users

---

## Part 4: Razorpay Integration Preparation

Create edge function `supabase/functions/razorpay-webhook/index.ts`:
- Receives Razorpay payment success/failure webhooks
- Updates `user_subscriptions` table on successful payment
- Handles subscription cancellation and renewal

Create edge function `supabase/functions/create-razorpay-order/index.ts`:
- Called when user clicks "Upgrade"
- Creates Razorpay order with user details
- Returns order ID for frontend checkout

---

## Part 5: Immediate Fix (Clear Demo Data)

For now, I'll also add a mechanism to:
1. Remove the stale `minimind-tier: pro` from localStorage
2. Reset your view to the actual Free tier

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/xxx_user_subscriptions.sql` | Create | Database table + RLS |
| `src/contexts/SubscriptionContext.tsx` | Modify | Database-backed subscription state |
| `src/components/pages/SubscriptionPage.tsx` | Modify | Show real status, prepare Razorpay |
| `supabase/functions/create-razorpay-order/index.ts` | Create | Backend order creation |
| `supabase/functions/razorpay-webhook/index.ts` | Create | Payment verification |

---

## What You'll See After Implementation

**As a Free User:**
- 15 daily credits shown with usage tracking
- "Upgrade to Pro" section with ₹199/month or ₹1,999/year options
- Clicking "Upgrade Now" will trigger Razorpay checkout

**As a Pro User (after payment):**
- 100 daily + 500 monthly credits
- Pro Dashboard with actual billing date from Razorpay
- Cancel/manage subscription options

---

## Razorpay Integration Steps (For You)

Once I implement the backend structure, you'll need to:
1. Add your Razorpay Key ID and Secret as secrets
2. Configure the Razorpay webhook URL in your Razorpay dashboard
3. Test the payment flow end-to-end
