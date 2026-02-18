
# Enhanced MiniMind Title - Professional Trust-Building Colors

## Overview
Replace the tricolor (Indian flag) gradient on the "MiniMind" title with a professional, trust-building color scheme using the existing brand palette. The "Made in India" badge with the Ashoka Chakra will remain unchanged.

## Color Psychology for Trust
The new title will use your existing brand colors which are perfect for building trust:
- **Blue (Primary)**: Reliability, professionalism, intelligence
- **Purple (Secondary)**: Premium, wisdom, creativity  
- **Teal/Cyan (Accent)**: Modern, innovative, calming

These colors together create a sense of innovation, intelligence, and premium quality - perfect for an AI learning app.

---

## Changes

### File: `src/index.css`

**Update `.logo-text-india` class** (will rename to `.logo-text-premium` for clarity):

Current tricolor gradient:
```css
background: linear-gradient(90deg, saffron → white → green);
```

New professional gradient:
```css
background: linear-gradient(135deg, 
  hsl(221 83% 53%) 0%,      /* Brand Blue - Trust */
  hsl(263 70% 50%) 50%,      /* Brand Purple - Premium */
  hsl(189 94% 37%) 100%      /* Brand Teal - Innovation */
);
```

This is essentially your existing `--gradient-text` but applied with the black outline for better visibility.

**Update `.logo-glow-container`** to use blue/purple glow instead of saffron:
```css
background: linear-gradient(135deg, 
  hsl(var(--brand-primary) / 0.1) 0%, 
  hsl(var(--brand-secondary) / 0.05) 100%
);
```

### File: `src/components/MobileHeader.tsx`

**Update the glow animation** to pulse with blue/purple instead of saffron:
```tsx
boxShadow: [
  '0 0 8px hsl(var(--brand-primary) / 0.3)',
  '0 0 16px hsl(var(--brand-primary) / 0.5)',
  '0 0 8px hsl(var(--brand-primary) / 0.3)'
]
```

**Update profile button ring** from `ring-india-navy/20` to `ring-primary/20` for consistency.

---

## Visual Result

| Element | Before | After |
|---------|--------|-------|
| Title "MiniMind" | Saffron → White → Green | Blue → Purple → Teal |
| Logo Glow | Saffron pulse | Blue pulse |
| Made in India Badge | Unchanged (keeps tricolor) | Unchanged |
| Profile Ring | Navy tint | Blue tint |

---

## Files to Modify
1. `src/index.css` - Update `.logo-text-india` gradient and `.logo-glow-container`
2. `src/components/MobileHeader.tsx` - Update glow animation colors and profile ring

The "Made in India" badge with the Ashoka Chakra will remain exactly as it is - only the title gradient changes.
