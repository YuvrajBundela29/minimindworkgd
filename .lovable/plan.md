
# MiniMind Mobile Experience Enhancement Plan

## Overview
This plan addresses three critical mobile UX issues:
1. **Data Persistence** - Answers vanishing on page refresh
2. **Back Button Behavior** - App closing instead of navigating back (double-tap to exit)
3. **Header Enhancement** - Making the MiniMind header more professional and trust-inspiring with an "Indian-made" identity

---

## Issue 1: Data Persistence on Refresh

### Problem
When users refresh the app on mobile, all answers from the home screen disappear. The app starts fresh instead of restoring the previous session.

### Solution
Persist the current session state (question, answers, loading states) to localStorage and restore it on app load.

### Changes Required

**File: `src/pages/Index.tsx`**
- Add a new localStorage key: `minimind-current-session`
- Store the active session data:
  - `currentQuestion`
  - `answers`
  - `hasAskedQuestion`
  - `chatHistories`
- Restore this data on initial load (in the existing `useEffect` that loads saved data)
- Add a new `useEffect` to save session data whenever it changes
- Clear session data when user starts a new question (so old answers don't persist incorrectly)

---

## Issue 2: Double-Back to Exit App

### Problem
When users press the back button on their phone, the app closes immediately instead of navigating to the previous page.

### Solution
Implement a hardware back button handler using the browser's `popstate` event that:
1. Navigates to the previous page if not on home
2. Shows a "Press back again to exit" toast on home page
3. Exits only on second back press within 2 seconds

### Changes Required

**File: `src/pages/Index.tsx`**
- Add a `backPressCount` ref to track consecutive back presses
- Add a `useEffect` to listen for the browser's `popstate` event
- Push history states when navigating between pages (so back button has history to work with)
- Show a toast message: "Press back again to exit" on first back press from home
- Reset the counter after 2 seconds timeout

**File: `src/components/SideMenu.tsx`** (if needed)
- Ensure navigation also pushes browser history states

---

## Issue 3: Enhanced MiniMind Header

### Problem
The current header is basic and doesn't evoke trust or an "Indian-made" identity.

### Solution
Redesign the header with:
- **Color Psychology for Trust**: Navy blue (reliability, professionalism) combined with saffron/orange (energy, warmth, Indian identity)
- **Subtle Indian Identity**: Colors inspired by the Indian flag without being too literal
- **Enhanced Typography**: Larger, bolder logo text with a refined gradient
- **Subtle Animation**: Gentle pulse or glow on the logo for premium feel
- **Badge**: "Made in India" or "Bharat" subtle badge

### Changes Required

**File: `src/components/MobileHeader.tsx`**
- Redesign the header layout with a more premium look
- Add a subtle "Made in India" badge (using a flag or text)
- Use navy blue (#1a365d) as background/accent for trust
- Add saffron/orange gradient touches for Indian identity
- Improve logo animation with a gentle glow effect
- Make the logo larger (from w-8 h-8 to w-9 h-9)
- Add a subtle border or shadow for depth

**File: `src/index.css`**
- Add new CSS variables for Indian-themed colors:
  - `--india-saffron`: Deep saffron (#FF6B35)
  - `--india-navy`: Navy blue (#1E3A5F or #0D2137)
  - `--india-green`: Indian green (#138808)
- Add a new `.logo-text-india` class with an Indian-themed gradient
- Add subtle glow animation for the header

---

## Technical Details

### Session Persistence Data Structure
```text
minimind-current-session = {
  currentQuestion: string,
  answers: { beginner: string | null, ... },
  hasAskedQuestion: boolean,
  chatHistories: { beginner: [...], ... },
  timestamp: number (for expiry check)
}
```

### Back Button State Flow
```text
User on Home (no question) → Back → Toast "Press again to exit"
                           → Back (within 2s) → App closes

User on Home (with answers) → Back → Clear answers, show empty state
                            → Back → Toast "Press again to exit"
                            → Back (within 2s) → App closes

User on Profile/Settings/etc → Back → Navigate to Home
```

### Color Palette for Header
| Color | Hex | Usage |
|-------|-----|-------|
| Navy Blue | #0D2137 | Primary header accent, trust |
| Deep Saffron | #FF6B35 | Logo gradient start |
| Warm Orange | #F7931E | Logo gradient middle |
| India Green | #138808 | Subtle accent (optional) |
| White | #FFFFFF | Text on dark backgrounds |

---

## Implementation Order
1. **Session Persistence** - Most critical for user experience
2. **Back Button Handler** - Second priority for mobile usability
3. **Header Enhancement** - Visual polish last

---

## Files to Modify
- `src/pages/Index.tsx` (persistence + back handler)
- `src/components/MobileHeader.tsx` (header redesign)
- `src/index.css` (new CSS variables and animations)
