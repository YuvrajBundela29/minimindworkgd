

# PURPOSE_LENS System for MiniMind (Updated)

This plan implements a context-aware adaptation layer that keeps the 4 fixed modes (Beginner, Thinker, Story, Mastery) unchanged while internally adapting their content based on WHY the user is learning.

---

## Key Changes from Original Plan

1. **One-Time Setup**: Purpose lens is asked ONLY on first launch, then persists permanently
2. **Dedicated Navigation Page**: New "Learning Purpose" page accessible from the side menu
3. **Custom Lens Option**: Users can create their own custom prompt to define their learning context

---

## Overview

```text
FIRST LAUNCH:
User sees Purpose Lens selector → Selects "JEE" → Saved permanently
     ↓
SUBSEQUENT LAUNCHES:
User goes directly to home → Lens already active
     ↓
TO CHANGE:
Side Menu → "Learning Purpose" page → Change or create custom
```

---

## What Will Change

### 1. New Configuration: Purpose Lens Options

**File: `src/config/minimind.ts`**

Add `purposeLenses` configuration:

| Lens ID | Name | Icon | Description |
|---------|------|------|-------------|
| `general` | General | 🌐 | Exploratory, curiosity-led learning |
| `jee` | JEE Prep | 🎯 | JEE Main/Advanced focused |
| `neet` | NEET Prep | 🩺 | NEET medical entrance focused |
| `student` | School Student | 📚 | Generic school curriculum |
| `parent` | Parent | 👨‍👩‍👧 | Helping your child learn |
| `teacher` | Teacher | 👩‍🏫 | Teaching methodology focused |
| `professional` | Professional | 💼 | Workplace/career context |
| `custom` | Custom | ✨ | User-defined purpose |

Each preset lens will have:
- Name, icon, and description
- Pre-built prompt adaptation rules
- Keywords for context

---

### 2. First-Time Purpose Lens Onboarding

**New File: `src/components/PurposeLensOnboarding.tsx`**

A full-screen overlay shown ONLY on first launch:
- Welcoming message: "What brings you to MiniMind?"
- Grid of lens options with icons and descriptions
- "Custom" option at the bottom
- Once selected, never shows again (saved to localStorage + database)

**Logic:**
```text
if (!localStorage.get('purposeLensSelected') && !userSettings.purpose_lens) {
  show PurposeLensOnboarding
} else {
  show normal home page
}
```

---

### 3. Dedicated Purpose Lens Page (Navigation)

**New File: `src/components/pages/PurposeLensPage.tsx`**

A full settings page for managing Purpose Lens:

**Sections:**

1. **Current Lens Display**
   - Shows active lens with icon and description
   - "Change" button

2. **Preset Lenses Grid**
   - All 7 preset options in a card grid
   - Selected one highlighted
   - Tap to switch instantly

3. **Custom Lens Section**
   - Text area for custom prompt (max 500 chars)
   - Preview of how it will affect responses
   - Save button
   - Examples: "I'm a UPSC aspirant focusing on Indian History and Polity"

4. **How It Works**
   - Brief explanation of how lens affects all 4 modes

**File: `src/config/minimind.ts` - Update Navigation**

Add new navigation item:
```typescript
{ 
  id: 'purposelens', 
  label: 'Learning Purpose 🎯', 
  icon: 'Target', 
  description: 'Set your learning context' 
}
```

---

### 4. Custom Lens Feature

**User Flow:**
1. User selects "Custom" option
2. Text input appears: "Describe your learning purpose..."
3. User types: "I'm preparing for GATE Computer Science exam"
4. System saves this as their custom prompt
5. All 4 modes now adapt to GATE CS context

**Database Schema:**
```sql
ALTER TABLE user_settings 
ADD COLUMN purpose_lens TEXT DEFAULT 'general',
ADD COLUMN custom_lens_prompt TEXT DEFAULT NULL;
```

**Edge Function Handling:**
- If `purpose_lens = 'custom'`, use `custom_lens_prompt` value
- Inject custom prompt into the system instructions

---

### 5. Enhanced Edge Function Prompts

**File: `supabase/functions/chat/index.ts`**

**Preset Lens Prompt Adapters:**
```text
PURPOSE_LENS_PROMPTS = {
  jee: {
    context: "JEE Main/Advanced competitive exam",
    examples: "IIT-level physics, chemistry, maths problems",
    tone: "Precise, exam-oriented, no fluff",
    relevance: "Connect to JEE syllabus and question patterns"
  },
  neet: {
    context: "NEET medical entrance exam",
    examples: "NCERT Biology, Physics, Chemistry concepts",
    tone: "Clinical precision, NCERT-aligned",
    relevance: "Focus on NEET-specific topics and weightage"
  },
  parent: {
    context: "Parent helping their child learn",
    examples: "Household activities, family situations",
    tone: "Calm, reassuring, patience-focused",
    relevance: "How to explain this to a child at home"
  },
  teacher: {
    context: "Educator preparing lessons",
    examples: "Classroom activities, teaching methods",
    tone: "Structured, pedagogical, question-driven",
    relevance: "How to teach this effectively"
  },
  custom: {
    // Uses user's custom_lens_prompt directly
    context: "${custom_lens_prompt}",
    tone: "Adapt naturally to the user's stated purpose"
  }
}
```

**Mode-Specific Lens Behavior remains the same:**
- Beginner: Simple BUT with lens-appropriate examples
- Thinker: Logical BUT with lens-appropriate reasoning
- Story: Narrative BUT set in lens-appropriate scenarios
- Mastery: Deep BUT focused on what mastery means for this lens

---

### 6. Frontend Integration

**File: `src/pages/Index.tsx`**

Changes:
- Add `purposeLens` and `customLensPrompt` state
- Check on mount: if no lens set, show onboarding overlay
- Load from localStorage first, then sync with user_settings
- Pass `purposeLens` and `customLensPrompt` to AIService

**File: `src/services/aiService.ts`**

Update all methods to accept:
```typescript
interface AIRequestOptions {
  purposeLens: string;
  customLensPrompt?: string;
}
```

**File: `src/components/MobileHeader.tsx`**

Add small lens indicator badge showing current lens icon (e.g., 🎯 for JEE)

**File: `src/components/SideMenu.tsx`**

Add "Learning Purpose" navigation item with Target icon

---

### 7. Settings Page Update

**File: `src/components/pages/SettingsPage.tsx`**

Remove any purpose lens UI from settings (it now has its own dedicated page)

Or optionally add a quick link: "Learning Purpose → Go to settings"

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/PurposeLensOnboarding.tsx` | First-time lens selection overlay |
| `src/components/pages/PurposeLensPage.tsx` | Dedicated page for managing purpose lens |

## Files to Modify

| File | Changes |
|------|---------|
| `src/config/minimind.ts` | Add `purposeLenses` config + navigation item |
| `supabase/functions/chat/index.ts` | Add lens-aware prompt adapters with custom support |
| `src/services/aiService.ts` | Add `purposeLens` and `customLensPrompt` parameters |
| `src/pages/Index.tsx` | Add lens state, show onboarding on first launch |
| `src/components/MobileHeader.tsx` | Add lens indicator badge |
| `src/components/SideMenu.tsx` | Add Learning Purpose navigation item |

## Database Migration

```sql
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS purpose_lens TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS custom_lens_prompt TEXT DEFAULT NULL;
```

---

## User Flow Summary

```text
┌─────────────────────────────────────────────────────────────┐
│                    FIRST TIME USER                          │
├─────────────────────────────────────────────────────────────┤
│  Opens app → Full-screen Purpose Lens selector appears      │
│  Selects "JEE Prep" → Saved → Never asked again             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   RETURNING USER                            │
├─────────────────────────────────────────────────────────────┤
│  Opens app → Goes directly to home with JEE lens active     │
│  Sees 🎯 badge in header indicating current lens            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   WANTS TO CHANGE                           │
├─────────────────────────────────────────────────────────────┤
│  Opens side menu → Taps "Learning Purpose 🎯"               │
│  Full page with all options + Custom input                  │
│  Selects new lens or creates custom → Saved immediately     │
└─────────────────────────────────────────────────────────────┘
```

---

## Custom Lens Examples

Users can enter prompts like:
- "I'm a UPSC Civil Services aspirant focusing on Indian History, Polity, and Geography"
- "I'm a Class 10 CBSE student preparing for board exams"
- "I'm learning programming to switch careers into software development"
- "I'm a medical professional wanting to explain concepts to patients"
- "I'm preparing for CAT MBA entrance exam"

The system will adapt all 4 modes to match their specific context.

---

## Implementation Order

1. **Database** - Add purpose_lens and custom_lens_prompt columns
2. **Configuration** - Add purposeLenses to minimind.ts with navigation
3. **Edge Function** - Implement lens-aware prompt system with custom support
4. **AIService** - Update to pass purposeLens and customLensPrompt
5. **Onboarding Component** - Build first-time lens selector
6. **Purpose Lens Page** - Build dedicated management page
7. **Index.tsx** - Wire up state, persistence, and onboarding logic
8. **Navigation** - Add to SideMenu and header indicator

