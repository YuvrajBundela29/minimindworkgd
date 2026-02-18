

# Add "New Chat" Button for Fresh Home Screen

## Overview
Add a "New Chat" button (similar to ChatGPT) that clears the current conversation and returns to the fresh home screen with the hero empty state and suggested prompts. The button will appear in two places for easy access.

## What Changes

### 1. `src/components/MobileHeader.tsx` -- Add "New Chat" button
- Accept a new `onNewChat` prop and a `hasActiveChat` boolean prop
- When `hasActiveChat` is true, show a "+" (PenSquare/SquarePen) icon button next to the menu button
- Tapping it triggers `onNewChat` which resets everything

### 2. `src/components/SideMenu.tsx` -- Add "New Chat" at top
- Accept a new `onNewChat` prop
- Add a prominent "New Chat" button at the very top of the side menu (above the Learn section), styled with a primary outline and a PenSquare icon
- Clicking it calls `onNewChat` and closes the menu

### 3. `src/pages/Index.tsx` -- Wire up the reset logic
- Extract the existing reset logic (from the back-button handler at lines 266-276) into a reusable `handleNewChat` callback:
  - Clear answers to defaults
  - Clear currentQuestion
  - Set hasAskedQuestion to false
  - Reset chatHistories
  - Clear question input
  - Remove session from localStorage
  - Cancel any pending API requests
  - Show a subtle toast: "Starting fresh!"
- Pass `handleNewChat` to both `MobileHeader` and `SideMenu`
- Pass `hasAskedQuestion` to `MobileHeader` so the button only shows when there's an active chat

## Visual Placement

```text
Header: [Menu] [MiniMind Logo] [+New] [Profile]
                                  ^-- only visible when chat is active

Side Menu:
  [MiniMind Logo]           [X]
  [+ New Chat button - full width, outlined]
  --------------------------------
  LEARN
    Ask AI
    Study Plans
    ...
```

## Files to Modify
1. `src/components/MobileHeader.tsx` -- Add new chat icon button
2. `src/components/SideMenu.tsx` -- Add new chat button at top
3. `src/pages/Index.tsx` -- Create `handleNewChat` callback and pass as prop
