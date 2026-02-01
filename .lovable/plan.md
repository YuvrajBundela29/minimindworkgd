
# Fix: Back Button Navigation & Session Persistence

## Overview
This plan addresses two critical mobile UX bugs:
1. **Swipe-from-corner closes app** instead of navigating back
2. **Answers vanish on page refresh** despite persistence code

---

## Problem 1: Back Button/Swipe Not Working

### Root Cause
The current approach relies on `event.preventDefault()` in the `popstate` handler, but **this doesn't work** - by the time `popstate` fires, the browser has already navigated. The app only pushes one history entry on load, so swiping back immediately exits to the previous page (before the app).

### Solution
Create a proper history stack with multiple entries:
1. Push a "home" state on initial load
2. Push additional states when user:
   - Navigates to subpages (profile, settings, etc.)
   - Asks a question (so back can clear answers)
3. When `popstate` fires, handle the state that's now active rather than trying to prevent navigation

### Changes to `src/pages/Index.tsx`

**Update the back button handler:**
```text
1. Remove all event.preventDefault() calls (they don't work for popstate)
2. Push TWO initial history entries to create a "buffer"
3. When popstate fires, immediately re-push a state to restore the history entry
4. Handle the actual navigation based on current app state
```

**Push history when asking a question:**
- Add `window.history.pushState({ page: 'answers' }, '')` in `handleSubmit` after setting `hasAskedQuestion`
- This creates a history entry that back button can navigate from

**Push history when navigating to subpages:**
- Add a `handleNavigate` wrapper function that pushes history before calling `setCurrentPage`
- Update `SideMenu` and `MobileHeader` to use this new handler

---

## Problem 2: Session Persistence Not Working

### Root Cause
The save logic only runs when `hasAskedQuestion && currentQuestion` are both truthy. During initial load, there may be a race condition where states update asynchronously, and the restore happens but then gets overwritten by default states.

### Solution
1. Add a "restored" flag to prevent overwriting restored data
2. Ensure the full answers object (including nulls for loading modes) doesn't overwrite complete answers
3. Add a small delay before saving to ensure all state updates complete

### Changes to `src/pages/Index.tsx`

**Add a restoration flag:**
```typescript
const restoredRef = useRef(false);
```

**Update the restore logic:**
- Set `restoredRef.current = true` after restoring session
- Skip initial re-save if just restored

**Update the save logic:**
- Only save when answers have at least one non-null value
- Add a check: `if (!restoredRef.current || Object.values(answers).some(a => a !== null))`

---

## Technical Implementation

### Updated Back Button Flow

```text
User opens app
├── Push "buffer" state (allows one back press)
├── Push "home" state (current state)

User asks question
├── Push "answers" state
├── Back gesture → Clear answers, stay on home
├── Back gesture → Show toast "Press again to exit"  
├── Back gesture (within 2s) → App closes

User navigates to Profile
├── Push "profile" state
├── Back gesture → Return to home with answers
```

### Session Persistence Flow

```text
On Load:
├── Check localStorage for session
├── Validate timestamp (< 24 hours)
├── Restore states: currentQuestion, answers, hasAskedQuestion, chatHistories
├── Set restoredRef = true

On State Change:
├── Check if hasAskedQuestion is true
├── Check if at least one answer exists
├── Skip if just restored (prevent immediate re-save with partial data)
├── Save to localStorage with timestamp
```

---

## Files to Modify

1. **`src/pages/Index.tsx`**
   - Add `restoredRef` to prevent race conditions
   - Rewrite back button handler with proper history stack management
   - Add history push in `handleSubmit`
   - Create `handleNavigate` wrapper for page changes
   - Update save logic to check for valid data

2. **`src/components/SideMenu.tsx`**
   - Update `onNavigate` calls to use new handler (already uses it via props)

3. **`src/components/MobileHeader.tsx`**
   - Ensure profile click pushes history (will receive updated handler)

---

## Expected Behavior After Fix

| Action | Before (Broken) | After (Fixed) |
|--------|-----------------|---------------|
| Swipe back from corner | App closes | Clear answers / Navigate back / Toast |
| Refresh with answers | Answers gone | Answers restored |
| Navigate to Profile → Back | Sometimes works | Returns to home with answers |
| Double-back on empty home | Inconsistent | Toast → Exit |
