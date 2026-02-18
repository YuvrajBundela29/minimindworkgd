

# Add Credit Consumption to All Features

## Problem
Currently, credits are only consumed in **Explain-It-Back** and **File Analysis** pages. The main question flow (4 modes), **Quick Recall (Ekakshar)**, **Study Plans (Learning Paths)**, and **follow-up chats** do NOT deduct credits. The Purpose Lens page is a settings page (no AI call), so it does not need credits.

## Credit Costs

Add missing costs to the `CREDIT_COSTS` map:

| Feature | Cost | Key |
|---------|------|-----|
| Beginner Mode | 1 | `beginner` |
| Thinker Mode | 2 | `thinker` |
| Story Mode | 3 | `story` |
| Mastery Mode | 4 | `mastery` (NEW) |
| Quick Recall (3 compressions) | 3 | `ekakshar_quick` (NEW) |
| Ekakshar++ (existing) | 5 | `ekakshar` |
| Study Plan generation | 5 | `learningPath` |
| Study Plan topic explanation | 2 | `learningPathTopic` (NEW) |
| Explain-It-Back | 2 | `explainBack` (NEW, already charged inline) |
| Follow-up chat | same as mode | uses mode key |

**Full question (all 4 modes) = 1 + 2 + 3 + 4 = 10 credits total**

---

## Changes

### 1. `src/contexts/SubscriptionContext.tsx`
- Add `mastery: 4`, `ekakshar_quick: 3`, `learningPathTopic: 2`, `explainBack: 2` to `CREDIT_COSTS`

### 2. `src/pages/Index.tsx` -- Main Question Flow
- Import `useCredits`, `hasCredits`, `showUpgradePrompt`, `getCredits` from `useSubscription()`
- **In `handleSubmit`**: Before the staggered loop starts, check if user has at least 1 credit. If not, show upgrade prompt and return. Inside the loop, before each mode's API call, check `hasCredits(cost)` for that mode. If insufficient, set a "Not enough credits" message for that mode and skip. After successful response, call `useCredits(cost, modeKey)`
- **In `handleChatSubmit`**: Before the API call, check `hasCredits(cost)` for the active mode. If not enough, show upgrade prompt and return. After successful response, call `useCredits(cost, modeKey)`

### 3. `src/components/pages/EkaksharPage.tsx` -- Quick Recall
- Import `useSubscription` and `CREDIT_COSTS`
- In `handleQuickCompress`: Before API calls, check `hasCredits(3)`. If not enough, show upgrade prompt and return. After successful response, call `useCredits(3, 'ekakshar_quick')`

### 4. `src/components/pages/LearningPathPage.tsx` -- Study Plans
- Replace the old `canAskQuestion()` / `useQuestion()` calls with proper credit-based calls
- **In `generatePath`**: Check `hasCredits(5)`, deduct `useCredits(5, 'learningPath')` after success
- **In `loadTopicExplanation`**: Check `hasCredits(2)`, deduct `useCredits(2, 'learningPathTopic')` after success

### 5. `src/components/pages/ExplainBackPage.tsx` -- Test Yourself
- Already uses `hasCredits(2)` and `useCredits(2, 'explain_back')` -- just needs the cost added to the central `CREDIT_COSTS` map for consistency

### 6. Low Credit Toast
- After each credit deduction in Index.tsx and EkaksharPage.tsx, check remaining credits. If total falls below 5, show a warning toast: "Running low on credits!"

---

## What Does NOT Change
- Purpose Lens page (settings only, no AI calls, no credits needed)
- File Analysis page (already has credit checks)
- Ekakshar++ page (already has credit checks)
- Backend edge functions
- Database schema

## Files to Modify
1. `src/contexts/SubscriptionContext.tsx`
2. `src/pages/Index.tsx`
3. `src/components/pages/EkaksharPage.tsx`
4. `src/components/pages/LearningPathPage.tsx`

