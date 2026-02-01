
# Web App Performance Audit & Optimization Plan for MiniMind

This comprehensive audit identifies performance bottlenecks and provides actionable solutions to improve load times, responsiveness, and Core Web Vitals (LCP, FID, CLS).

---

## Executive Summary

### Current Performance Issues Identified

| Issue | Impact | Priority |
|-------|--------|----------|
| All page components loaded upfront | High bundle size, slow initial load | Critical |
| 4 parallel AI API calls on submit | Network congestion, slow response | High |
| Large framer-motion animations | Render blocking, high CPU usage | High |
| External fonts blocking render | Delayed First Contentful Paint | Medium |
| jsPDF loaded eagerly | Unnecessary initial bundle bloat | Medium |
| No API response caching | Duplicate requests waste resources | Medium |
| Large component re-renders | Poor FID scores on mobile | Medium |

### Target Metrics

| Metric | Current (Est.) | Target | Description |
|--------|---------------|--------|-------------|
| LCP | ~3.5s | <2.5s | Largest Contentful Paint |
| FID | ~150ms | <100ms | First Input Delay |
| CLS | ~0.15 | <0.1 | Cumulative Layout Shift |
| TTI | ~4s | <3s | Time to Interactive |

---

## Phase 1: Lazy Loading Heavy Components

### Problem
All 12 page components in `src/components/pages/` are imported synchronously in `Index.tsx`, bloating the initial bundle.

### Solution
Use React.lazy() and Suspense for route-based code splitting.

### Files to Modify

**`src/pages/Index.tsx`**
- Convert static imports to dynamic imports for all page components
- Wrap lazy components with Suspense and loading fallbacks

**Components to Lazy Load:**
```text
- EkaksharPage (~15KB)
- HistoryPage (~8KB)
- SettingsPage (~10KB)
- ProfilePage (~12KB)
- SubscriptionPage (~18KB)
- LearningPathPage (~25KB) ← Largest
- ExplainBackPage (~15KB)
- AuthPage (~10KB)
- OnboardingGuide (~8KB)
- FullscreenMode (~12KB)
```

**New File: `src/components/PageLoadingFallback.tsx`**
- Lightweight skeleton component for page transitions
- Uses simple CSS animations (no framer-motion)

### Implementation Pattern
```typescript
// Before
import LearningPathPage from '@/components/pages/LearningPathPage';

// After
const LearningPathPage = React.lazy(() => 
  import('@/components/pages/LearningPathPage')
);

// Usage with Suspense
<Suspense fallback={<PageLoadingFallback />}>
  <LearningPathPage />
</Suspense>
```

### Expected Impact
- Initial bundle reduction: ~80KB (estimated 25-30% smaller)
- Faster Time to Interactive on first load

---

## Phase 2: Optimize AI API Calls

### Problem
When user submits a question, 4 parallel API calls fire immediately to the edge function. This causes:
- Network congestion on slow connections
- All-or-nothing loading experience
- Wasted credits if user navigates away

### Solution: Staggered Loading with Priority

**`src/pages/Index.tsx` - handleSubmit modification**

1. **Priority-based loading**: Load `beginner` mode first (fastest, most common)
2. **Sequential with delay**: Stagger remaining calls by 500ms
3. **Abort controller**: Cancel pending requests on navigation

**`src/services/aiService.ts` - Add request management**

- Add AbortController support to all API methods
- Implement request deduplication
- Add response caching layer

### New File: `src/services/apiCache.ts`

```typescript
interface CacheEntry {
  response: string;
  timestamp: number;
  expiresIn: number; // 5 minutes default
}

class APICache {
  private cache: Map<string, CacheEntry>;
  
  get(key: string): string | null;
  set(key: string, response: string): void;
  generateKey(prompt: string, mode: string, language: string): string;
  clear(): void;
}
```

### Loading Strategy

```text
User submits question
    ↓
Load Beginner mode immediately (visible first)
    ↓
After Beginner responds OR 500ms, load Thinker
    ↓
After Thinker responds OR 500ms, load Story
    ↓
After Story responds OR 500ms, load Mastery
```

### Expected Impact
- Perceived performance improvement: 40-50%
- Reduced network congestion
- Better mobile experience

---

## Phase 3: Reduce Render-Blocking Resources

### Problem 1: Google Fonts blocking render

**Current `index.html`:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
```

**Current `src/index.css`:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
```

### Solution: Font Loading Optimization

**`index.html` changes:**
- Add preload hints for critical fonts
- Use `font-display: swap` via URL parameter
- Load only required font weights

**`src/index.css` changes:**
- Remove @import (blocking)
- Use JavaScript font loading API for non-critical fonts

```html
<!-- Critical fonts - preload -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" as="style" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="..."></noscript>

<!-- Non-critical fonts - lazy load -->
<link rel="preload" href="...Poppins..." as="style" media="print" onload="this.media='all'">
```

### Problem 2: Framer-motion heavy animations

**Solution: Reduce animation complexity**

**`src/components/HeroEmptyState.tsx`:**
- Reduce staggered animation delays
- Use CSS transforms instead of motion.div where possible

**`src/components/ModeCard.tsx`:**
- Use CSS transitions for hover states
- Reserve framer-motion for complex sequences only

**New utility: `src/utils/prefersReducedMotion.ts`**
```typescript
export const prefersReducedMotion = () => 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

### Expected Impact
- FCP improvement: 300-500ms
- Reduced main thread blocking

---

## Phase 4: Lazy Load Heavy Libraries

### Problem
jsPDF (150KB+ gzipped) is loaded on initial page load, even though PDF generation is rarely used.

### Solution: Dynamic Import

**`src/utils/pdfGenerator.ts` changes:**

```typescript
// Before
import jsPDF from 'jspdf';

// After - dynamic import
export async function generatePDF(...) {
  const { jsPDF } = await import('jspdf');
  // ... rest of function
}
```

### Other Heavy Dependencies to Lazy Load

| Library | Size | Lazy Load When |
|---------|------|----------------|
| jsPDF | ~150KB | User clicks Download/Share PDF |
| recharts | ~200KB | User visits Progress page |
| framer-motion | ~100KB | Already tree-shaken, but reduce usage |

### Expected Impact
- Initial bundle reduction: ~150KB
- Faster TTI for majority of users

---

## Phase 5: Image & Asset Optimization

### Problem
Logo loaded from external URL (`https://i.ibb.co/fGLH5Dxs/minimind-logo.png`)

### Solution

**Option A: Self-host optimized assets**
- Download and optimize logo
- Convert to WebP format
- Add to `public/` folder

**Option B: Add loading optimization**
- Preload critical images in `index.html`
- Add width/height to prevent CLS

```html
<link rel="preload" as="image" href="https://i.ibb.co/fGLH5Dxs/minimind-logo.png">
```

**`src/components/MobileHeader.tsx`:**
```tsx
<img 
  src="..." 
  alt="MiniMind" 
  width={32} 
  height={32}  // Explicit dimensions prevent CLS
  loading="eager" // Critical image
/>
```

---

## Phase 6: Component Optimization

### Problem: Unnecessary Re-renders

**Index.tsx has many state updates causing full re-renders**

### Solution: Memoization Strategy

**New file: `src/hooks/useMemoizedCallbacks.ts`**
- Extract and memoize all handlers
- Use useCallback with proper dependencies

**Components to memoize with React.memo:**
- ModeCard
- HeroEmptyState
- BottomInputBar

**State splitting:**
- Separate UI state from data state
- Use useReducer for complex state

### Implementation

```typescript
// Memoize ModeCard to prevent re-renders
const MemoizedModeCard = React.memo(ModeCard, (prev, next) => {
  return prev.answer === next.answer && 
         prev.isLoading === next.isLoading &&
         prev.modeKey === next.modeKey;
});
```

---

## Phase 7: Service Worker & Caching

### New File: `public/sw.js`

**Cache Strategy:**
- Static assets: Cache First
- API responses: Network First with cache fallback
- Edge function responses: Cache with 5-minute TTL

**Manifest for PWA: `public/manifest.json`**
- Enable offline mode for static pages
- Add to home screen capability

---

## Performance Profiling Steps

### How to Measure Current Performance

1. **Chrome DevTools Lighthouse**
   - Open DevTools → Lighthouse tab
   - Select "Mobile" and "Performance"
   - Run audit and note baseline scores

2. **Performance Panel Recording**
   - Record while submitting a question
   - Look for long tasks (>50ms)
   - Identify render-blocking resources

3. **Network Panel Analysis**
   - Filter by "Doc" and "Font"
   - Check waterfall for blocking resources
   - Note total transfer size

4. **React DevTools Profiler**
   - Record component renders
   - Identify components re-rendering unnecessarily

### Key Metrics to Track

| Metric | Tool | Target |
|--------|------|--------|
| LCP | Lighthouse | <2.5s |
| FID | Lighthouse | <100ms |
| CLS | Lighthouse | <0.1 |
| Bundle Size | `npm run build` | <300KB initial |
| API Response Time | Network panel | <2s per mode |

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/PageLoadingFallback.tsx` | Lightweight loading skeleton |
| `src/services/apiCache.ts` | API response caching layer |
| `src/utils/prefersReducedMotion.ts` | Respect user motion preferences |
| `src/hooks/useMemoizedCallbacks.ts` | Optimized callback hooks |
| `public/sw.js` | Service worker for caching |
| `public/manifest.json` | PWA manifest |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Lazy loading, staggered API calls, memoization |
| `src/services/aiService.ts` | AbortController, caching integration |
| `src/utils/pdfGenerator.ts` | Dynamic jsPDF import |
| `src/index.css` | Remove blocking font import |
| `index.html` | Font preloading, image preload hints |
| `src/components/HeroEmptyState.tsx` | Reduce animation complexity |
| `src/components/ModeCard.tsx` | React.memo wrapper |
| `src/components/BottomInputBar.tsx` | Memoization |
| `vite.config.ts` | Code splitting configuration |

---

## Technical Implementation Details

### Vite Code Splitting Configuration

**`vite.config.ts` additions:**
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom'],
        'vendor-motion': ['framer-motion'],
        'vendor-pdf': ['jspdf'],
        'vendor-charts': ['recharts'],
      }
    }
  }
}
```

### API Cache Key Strategy

```text
Cache Key = hash(prompt + mode + language)

Example:
"explain_photosynthesis_beginner_en" → cached response

TTL: 5 minutes (configurable)
Max entries: 50 (LRU eviction)
```

### Abort Controller Usage

```typescript
// In Index.tsx
const abortControllerRef = useRef<AbortController | null>(null);

const handleSubmit = async () => {
  // Cancel any pending requests
  abortControllerRef.current?.abort();
  abortControllerRef.current = new AbortController();
  
  try {
    await AIService.getExplanation(
      question, 
      mode, 
      language, 
      abortControllerRef.current.signal
    );
  } catch (e) {
    if (e.name === 'AbortError') return; // Ignore aborted
    throw e;
  }
};
```

---

## Implementation Order

1. **Font optimization** (index.html, index.css) - Quick win, immediate LCP improvement
2. **Lazy loading pages** - Major bundle size reduction
3. **API call optimization** - Better perceived performance
4. **jsPDF dynamic import** - Bundle size reduction
5. **Component memoization** - Improved FID
6. **Service worker** - Offline support & caching
7. **Animation reduction** - Mobile CPU relief

---

## Expected Results Summary

| Optimization | Bundle Impact | Load Time Impact |
|--------------|---------------|------------------|
| Lazy load pages | -80KB | -500ms TTI |
| Font optimization | - | -300ms FCP |
| jsPDF dynamic | -150KB | -200ms initial |
| API staggering | - | -40% perceived wait |
| Memoization | - | -50ms FID |
| Service worker | - | Instant repeat visits |

**Total Expected Improvement:**
- Initial bundle: ~230KB smaller
- Time to Interactive: 1-1.5s faster
- Lighthouse Performance Score: 75+ (from estimated 55-60)
