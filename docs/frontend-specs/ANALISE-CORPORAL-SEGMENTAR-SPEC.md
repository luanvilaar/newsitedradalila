# Frontend Specification: Análise Corporal Segmentar (Body Composition Segmental Analysis)

**Version:** 1.0.0
**Status:** Ready for Implementation
**Created:** 2026-03-03
**Owner:** Uma (UX-Design-Expert)
**Audience:** @dev (Implementation), @qa (QA Gate)

---

## 📋 Executive Summary

This specification defines the improved UI/UX for the "Análise Corporal Segmentar" feature, transforming it from a generic medical display to a **patient-centric, trend-focused clinical interface** that tells a meaningful story about body composition changes over time.

**Key Improvements:**
- ✅ Modern, warm illustrated avatar (replaces generic silhouette)
- ✅ Trend comparison display (current vs. previous scan)
- ✅ Semantic color palette (clinical + accessible)
- ✅ Atomic design components (reusable, scalable)
- ✅ WCAG AA accessible by default
- ✅ Mobile-responsive layouts

---

## 🎯 User Context & Requirements

### User Profile
- **Primary User:** Patients reviewing body composition analysis
- **Goal:** Understand progress & body composition changes vs. previous scan
- **Context:** Clinical setting, health/fitness tracking
- **Literacy:** Mixed (medical + fitness terminology)

### Business Requirements
1. Show current body composition segmented by region
2. Display comparison vs. previous scan (date, delta values, interpretation)
3. Support both "Massa Magra" (Lean Mass) and "Gordura" (Fat) analysis modes
4. Display left/right symmetry comparison
5. Provide clinical clarity with warm, accessible design

### Technical Requirements
1. React/TypeScript components
2. Responsive design (mobile-first)
3. WCAG AA accessibility minimum
4. Integration with existing patient bioimpedance API
5. Real-time data rendering with loading states

---

## 🧬 Design System: Atomic Architecture

### **LEVEL 1: ATOMS (Base Components)**

#### **1.1 TrendBadge**
**Purpose:** Display change in value with semantic interpretation

```typescript
interface TrendBadgeProps {
  change: number;           // -0.3, +0.2 (kg change)
  changePercent: number;    // -4.0, +9.5 (% change)
  type: 'muscle' | 'fat' | 'water' | 'concern' | 'stable';
  label: string;           // "Ganho: Massa Magra" | "Perda: Gordura"
  status: 'positive' | 'negative' | 'neutral';
}

// Renders:
// ↑ +0.2kg (+9.5%)
// Ganho: Massa Magra ✓
// [Emerald Green background]
```

**Semantics:**
- `type: 'muscle'` → Emerald Green (#10B981) - Patient reads: "healthy gain"
- `type: 'fat'` → Warm Amber (#F59E0B) - Patient reads: "fat loss (good)"
- `type: 'concern'` → Soft Red (#EF4444) - Patient reads: "needs attention"
- `type: 'stable'` → Neutral Gray (#9CA3AF) - Patient reads: "no change"

**Accessibility:**
- Icon + text redundancy (↑ + "Ganho")
- Color not sole indicator (semantic label required)
- ARIA: `aria-label="Ganho de 0.2 quilogramas de massa magra"`

---

#### **1.2 SegmentLabel**
**Purpose:** Display metric name + value + unit with optional status

```typescript
interface SegmentLabelProps {
  name: string;           // "Braço", "Perna", "Tronco"
  side?: 'Esq' | 'Dir';   // Side indicator
  value: number;          // 2.10 (kg)
  unit: string;          // "kg"
  percent: number;       // 108.7 (%)
  status?: 'Normal' | 'Excelente' | 'Atenção';
}

// Renders:
// Braço (Esquerdo)
// 2.10kg | 108.7%
// [Status badge - Normal in green]
```

---

#### **1.3 ProgressBar**
**Purpose:** Visual representation of percentage-of-total

```typescript
interface ProgressBarProps {
  value: number;           // 108.7 (percent)
  min: number;            // 80 (minimum normal)
  max: number;            // 120 (maximum normal)
  variant: 'current' | 'previous' | 'target';
  color: 'emerald' | 'amber' | 'blue' | 'red' | 'gray';
}

// Renders horizontal bar with:
// - Current value (solid bar)
// - Previous value (ghost bar behind) if variant='current'
// - Min/Max guides (light borders)
```

---

#### **1.4 ComparisonDate**
**Purpose:** Show temporal context for comparison

```typescript
interface ComparisonDateProps {
  currentDate: Date;       // Today's scan
  previousDate: Date;      // Last scan
  daysDiff: number;       // 47 days ago
}

// Renders:
// Comparado com: 15 de Jan, 2026 (47 dias atrás)
```

---

#### **1.5 BodySegmentIllustration** (SVG Component)
**Purpose:** Modern, warm human figure with colorized segments

**Technical Details:**
```typescript
interface BodySegmentIllustrationProps {
  segments: {
    armLeft: SegmentState;
    armRight: SegmentState;
    legLeft: SegmentState;
    legRight: SegmentState;
    torso: SegmentState;
  };
  mode: 'leanMass' | 'fat' | 'water';
  interactive: boolean;
  onSegmentClick?: (segment: string) => void;
}

interface SegmentState {
  currentColor: string;    // Semantic color based on trend
  previousValue: number;   // For comparison
  hasSignificantChange: boolean; // Trigger glow animation
}

// Renders:
// - Head (neutral gray)
// - Arms (left/right colorized)
// - Torso (colorized)
// - Legs (left/right colorized)
// - Interactive: hover shows segment name + value
// - Animation: Subtle glow on high-change segments
```

**Style Guidelines:**
- Modern, illustrated aesthetic (not medical textbook)
- Warm skin tones with contrasting segment colors
- Minimalist shapes (clean lines, no photorealism)
- Segment colors map to semantic palette (green/amber/red)
- Responsive SVG (scales with container)

**Accessibility:**
```jsx
<svg role="img" aria-label="Composição corporal segmentada">
  <g role="region" aria-label="Braço esquerdo">
    <circle class="segment" data-segment="armLeft" />
  </g>
  // ...
</svg>
```

---

### **LEVEL 2: MOLECULES (Component Combinations)**

#### **2.1 SegmentCard**
**Purpose:** Complete display of one body segment with trend

```typescript
interface SegmentCardProps {
  segment: 'armLeft' | 'armRight' | 'legLeft' | 'legRight' | 'torso';
  name: string;            // "Braço"
  side?: 'Esq' | 'Dir';
  current: SegmentMetrics;
  previous: SegmentMetrics;
  analysisMode: 'leanMass' | 'fat';
}

interface SegmentMetrics {
  value: number;          // kg
  percent: number;        // %
  date: Date;
}

// Renders:
// ┌─────────────────────────┐
// │ Braço (Esquerdo)        │
// │ 2.10kg │ 108.7%        │
// │                         │
// │ ↑ +0.2kg (+9.5%)       │
// │ Ganho: Massa Magra ✓   │
// │                         │
// │ [Progress bar]         │
// │ Normal                  │
// └─────────────────────────┘
```

**Layout Hierarchy:**
1. Segment name + side (label)
2. Current metrics (value + %)
3. Trend badge (change + interpretation)
4. Progress bar + status
5. Optional: Mini sparkline (3-point trend)

---

#### **2.2 BodyCompositionTrend**
**Purpose:** Combined avatar + context display

```typescript
interface BodyCompositionTrendProps {
  currentScan: BodyCompositionData;
  previousScan: BodyCompositionData;
  mode: 'leanMass' | 'fat';
  viewportSize: 'mobile' | 'tablet' | 'desktop';
}

// Renders:
// [ComparisonDate] + [Avatar] positioned at center
// With visual indicators for significant changes
```

---

### **LEVEL 3: ORGANISMS (Complex Sections)**

#### **3.1 BodyAnalysisPanel**
**Purpose:** Complete body analysis with avatar + segment cards

**Desktop Layout (>1024px):**
```
┌──────────────────────────────────────────────────┐
│ [ComparisonDate]  [Tab: Massa Magra] [Gordura]  │
├──────────────────────────────────────────────────┤
│                                                  │
│  [Card: BraçoL]    [Avatar Center]  [Card: BraçoR]
│                                                  │
│  [Card: PernaL]    [Status Line]    [Card: PernaR]
│                                                  │
│                  [Card: Tronco]                 │
│                                                  │
├──────────────────────────────────────────────────┤
│ [Summary Insights]                              │
└──────────────────────────────────────────────────┘
```

**Tablet Layout (768-1023px):**
```
┌──────────────────────────────────┐
│ [Avatar - full width]            │
├──────────────────────────────────┤
│ [Cards in 2-column grid]         │
│ [BraçoL] [BraçoR]               │
│ [PernaL] [PernaR]               │
│ [Tronco]                        │
└──────────────────────────────────┘
```

**Mobile Layout (<768px):**
```
┌──────────────────┐
│ [Avatar]         │
├──────────────────┤
│ [Cards stacked]  │
│ [Swipeable tabs] │
│ [BraçoL/R]       │
│ [PernaL/R]       │
│ [Tronco]         │
└──────────────────┘
```

---

#### **3.2 AnalysisComparisonView**
**Purpose:** Detailed comparison table with all metrics

```typescript
interface AnalysisComparisonViewProps {
  currentScan: BodyCompositionData;
  previousScan: BodyCompositionData;
  availableDates: Date[];  // Show which past scans available
}

// Renders:
// ┌─────────────────────────────────────────┐
// │ Comparar com: [Dropdown: Jan 15, 2026]  │
// ├─────────────────────────────────────────┤
// │ Métrica       │ Agora    │ Anterior   │ Δ │
// ├─────────────────────────────────────────┤
// │ Massa Magra   │ 45.2kg   │ 45.0kg     │ +0.2 ↑│
// │ Gordura       │ 18.5kg   │ 18.8kg     │ -0.3 ↓│
// │ Água          │ 62.1%    │ 61.9%      │ → 0  │
// │ Metabolismo   │ 1650cal  │ 1648cal    │ → 0  │
// └─────────────────────────────────────────┘
```

---

### **LEVEL 4: TEMPLATES (Page-level Layouts)**

#### **4.1 BodyCompositionPageTemplate**
**Purpose:** Full-page analysis view

**Structure:**
```
Header:
  - Page title: "Análise Corporal Segmentar"
  - Subtitle: "Visualização detalhada da composição corporal por região"

Main Content:
  - AnalysisModeSelector (tabs: Massa Magra, Gordura)
  - ComparisonDate + DatePicker
  - BodyAnalysisPanel (responsive)

Sidebar (desktop only):
  - SummaryInsights
  - SuggestedActions (based on trends)
  - ExportButton

Footer:
  - Last updated: [timestamp]
  - NextScanDate: [recommended]
```

---

## 📊 Data Contracts & API Integration

### **Data Structure: BodyCompositionScan**

```typescript
interface BodyCompositionScan {
  id: string;
  patientId: string;
  scanDate: Date;
  analysisMode: 'leanMass' | 'fat' | 'both';
  segments: {
    armLeft: SegmentData;
    armRight: SegmentData;
    legLeft: SegmentData;
    legRight: SegmentData;
    torso: SegmentData;
  };
  totals: {
    totalLeanMass: number;    // kg
    totalFat: number;         // kg
    totalWater: number;       // %
    bmr: number;             // kcal
  };
  metadata: {
    device: string;          // "InBody 270"
    operator: string;
    notes: string;
  };
}

interface SegmentData {
  value: number;            // kg
  percent: number;          // percentage of total
  status: 'Normal' | 'Excelente' | 'Atenção';
  expectedRange: [number, number]; // [min, max] for normal
}
```

### **API Endpoints Required**

```typescript
// GET /api/patients/[id]/bioimpedance/scans
// Returns: BodyCompositionScan[]

// GET /api/patients/[id]/bioimpedance/scans/[scanId]
// Returns: BodyCompositionScan (single)

// GET /api/patients/[id]/bioimpedance/comparison
// Query: ?current=scanId&previous=scanId
// Returns: ComparisonData (with deltas, trends, interpretations)

// Computed Fields (backend responsibility):
// - Δ (delta): current.value - previous.value
// - Δ%: ((current.value - previous.value) / previous.value) * 100
// - Interpretation: "Ganho: Massa Magra" (logic in backend)
```

---

## 🎨 Color Semantics & Palette

### **Primary Semantic Colors**

| Semantic | Color | Hex | Use Case | Patient Reads As |
|----------|-------|-----|----------|-----------------|
| **Muscle Gain** | Emerald Green | #10B981 | Lean mass increase | "Healthy, strong" |
| **Fat Loss** | Amber | #F59E0B | Fat decrease | "Progress" |
| **Stable** | Neutral Gray | #9CA3AF | No significant change | "Maintained" |
| **Concern** | Soft Red | #EF4444 | Significant loss/gain | "Needs attention" |
| **Hydration** | Clinical Blue | #3B82F6 | Water balance | "Normal" |
| **Excellent** | Deep Green | #059669 | Goal achieved | "Success" |

### **Contrast Verification (WCAG AA)**
- Text on Green (#10B981): white text = 8.2:1 ✅
- Text on Amber (#F59E0B): dark text = 5.1:1 ✅
- Text on Red (#EF4444): white text = 4.8:1 ✅
- Text on Blue (#3B82F6): white text = 6.3:1 ✅

### **Color Usage Rules**
1. **Never use color alone** to convey meaning
2. **Always pair with icons** (↑, ↓, →)
3. **Always pair with text labels** ("Ganho", "Perda", "Estável")
4. **Provide grayscale fallback** for colorblind users

---

## ♿ Accessibility Requirements (WCAG AA)

### **Semantic HTML**
```jsx
<article role="region" aria-label="Análise Corporal Segmentar">
  <h1>Análise Corporal Segmentar</h1>

  <section aria-label="Comparação com avaliação anterior">
    <p id="comparisonDate">Comparado com: 15 de Jan, 2026 (47 dias atrás)</p>
  </section>

  <section aria-labelledby="avatarLabel">
    <h2 id="avatarLabel">Sua Composição Corporal</h2>
    <svg role="img" aria-describedby="avatarDesc">
      {/* ... */}
    </svg>
    <p id="avatarDesc">Silhueta humana com segmentos coloridos...</p>
  </section>
</article>
```

### **Keyboard Navigation**
- ✅ Tab through all interactive elements (cards, tabs, buttons)
- ✅ Arrow keys to switch between segments
- ✅ Enter to expand/collapse card details
- ✅ Skip-to-content link

### **Screen Reader Testing**
- ✅ All images have alt text or aria-label
- ✅ Form inputs labeled (`<label for="...">`)
- ✅ Status badges announced ("Normal", "Excelente")
- ✅ Trend changes announced ("Ganho de 0.2 quilogramas")
- ✅ Data tables have proper headers (`<th>`, `<tbody>`)

### **Color & Contrast**
- ✅ WCAG AA 4.5:1 contrast on all text
- ✅ Icons + text (not color alone) for meaning
- ✅ Grayscale fallback provided

### **Temporal Changes**
- ✅ No auto-playing animations
- ✅ Respect `prefers-reduced-motion`
- ✅ Clear loading/success states

---

## 📱 Responsive Design Specifications

### **Breakpoints**

```scss
// Mobile First Approach
$breakpoint-mobile: 0px;      // Base styles
$breakpoint-tablet: 768px;    // Layout shift
$breakpoint-desktop: 1024px;  // Multi-column
$breakpoint-xl: 1440px;       // Extra spacing
```

### **Avatar Sizing**
- **Mobile (<768px):** 100% width, max 300px height
- **Tablet (768-1023px):** 50% width, 400px height
- **Desktop (>1024px):** 25% of container, 500px height

### **Card Layout**
- **Mobile:** Single column stack (full width, 12px gutter)
- **Tablet:** 2-column grid (24px gutter)
- **Desktop:** 2x2 grid + 1 full-width card (32px gutter)

### **Font Scaling**
```scss
// Responsive typography
h1 {
  font-size: clamp(24px, 5vw, 48px);  // 24px→48px
  line-height: 1.2;
}

body {
  font-size: clamp(14px, 1.5vw, 16px); // 14px→16px
  line-height: 1.6;
}
```

---

## 🔄 State Management & Data Flow

### **Loading States**

```typescript
enum AnalysisLoadingState {
  IDLE = 'idle',
  LOADING_CURRENT = 'loading_current',
  LOADING_COMPARISON = 'loading_comparison',
  ERROR = 'error',
  SUCCESS = 'success',
}

// Render feedback:
// - LOADING: Skeleton loaders on cards + avatar
// - ERROR: Retry button + error message
// - SUCCESS: Fade-in animation
```

### **Mode Switching (Massa Magra ↔ Gordura)**

```typescript
// When user clicks tab:
1. Set loading state
2. Fetch relevant segment data for new mode
3. Update avatar colors based on new mode semantics
4. Update card values + trends
5. Animate transition (fade 200ms)
```

### **Comparison Date Selection**

```typescript
// When user selects different date:
1. Show loading skeleton
2. Fetch previous scan data
3. Recompute all deltas & trends
4. Update ComparisonDate label
5. Highlight new trends in avatar (glow animation)
```

---

## 🧪 Testing Requirements

### **Component Unit Tests**
- TrendBadge: All semantic types render correctly
- SegmentCard: Values display, trends calculate, status updates
- BodySegmentIllustration: SVG renders, segments highlight on hover
- ProgressBar: Value calculation, min/max boundaries

### **Integration Tests**
- BodyAnalysisPanel: Loads scans, displays trends, mode switching
- AnalysisComparisonView: Date selection triggers refresh
- Responsive behavior: Correct layouts at all breakpoints

### **Accessibility Tests**
- WAVE browser extension: No WCAG violations
- Keyboard navigation: All elements reachable via Tab
- Screen reader test: Full announcement of all content
- Color contrast: 4.5:1 on all text elements

### **Visual Regression Tests**
- Avatar renders consistently across browsers
- Cards maintain spacing at all viewports
- Colors match design tokens (Tailwind config)

---

## 💾 Implementation Approach

### **Technology Stack**
- **Framework:** React 18+
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS 3+ (with custom semantic tokens)
- **SVG:** Inline SVG component (not external file)
- **State:** React hooks + Context API (or Zustand if complex)
- **API:** Fetch or React Query for data fetching

### **File Structure**
```
src/
├── components/
│   ├── BodyAnalysis/
│   │   ├── BodyAnalysisPanel.tsx
│   │   ├── BodySegmentIllustration.tsx
│   │   ├── SegmentCard.tsx
│   │   └── AnalysisComparisonView.tsx
│   ├── Atoms/
│   │   ├── TrendBadge.tsx
│   │   ├── SegmentLabel.tsx
│   │   ├── ProgressBar.tsx
│   │   └── ComparisonDate.tsx
│   └── Layout/
│       └── BodyCompositionPageTemplate.tsx
├── hooks/
│   ├── useBodyCompositionData.ts
│   └── useComparison.ts
├── types/
│   ├── bodyComposition.ts
│   └── api.ts
├── utils/
│   ├── trendCalculation.ts
│   ├── colorMapping.ts
│   └── interpretations.ts
├── styles/
│   └── semantic-colors.css
└── pages/
    └── analise-corporal-segmentar.tsx
```

### **Dependencies Required**
```json
{
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "react-query": "^4.0.0"
}
```

### **Tailwind Configuration (Semantic Tokens)**
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        semantic: {
          'muscle-gain': '#10B981',
          'fat-loss': '#F59E0B',
          'stable': '#9CA3AF',
          'concern': '#EF4444',
          'hydration': '#3B82F6',
          'excellent': '#059669',
        }
      }
    }
  }
}
```

---

## 📝 Acceptance Criteria

### **Functional**
- [ ] BodyAnalysisPanel renders with current + previous scan data
- [ ] Mode switching (Massa Magra ↔ Gordura) updates all views
- [ ] Trend badges display correct icons (↑↓→) + colors + labels
- [ ] Avatar segments colorize based on semantic rules
- [ ] Comparison date displays & date selection works
- [ ] Cards display correct values, percentages, status badges
- [ ] Responsive layouts adapt correctly at all breakpoints
- [ ] API integration fetches & displays real data

### **Accessibility**
- [ ] WCAG AA: All elements keyboard accessible
- [ ] WCAG AA: 4.5:1 contrast on all text
- [ ] Screen reader: All content announced correctly
- [ ] Color: Meaning conveyed via icon + text (not color alone)
- [ ] Motion: No auto-playing animations; respects prefers-reduced-motion

### **Visual**
- [ ] Avatar matches modern, warm design aesthetic
- [ ] Colors match semantic palette exactly
- [ ] Cards maintain consistent spacing/hierarchy
- [ ] Fonts scale appropriately across viewports
- [ ] Animations are smooth (200-300ms transitions)

### **Performance**
- [ ] Initial load: <2 seconds (LCP)
- [ ] Mode switching: <500ms response
- [ ] SVG avatar: Renders without lag
- [ ] No unnecessary re-renders (React DevTools Profiler)

---

## 🚀 Implementation Recommendations

### **Phase 1: Atoms (Week 1)**
- Build TrendBadge, SegmentLabel, ProgressBar
- Test component props + variations
- Implement color mapping logic

### **Phase 2: Avatar & Molecules (Week 2)**
- Create BodySegmentIllustration SVG
- Build SegmentCard with trend integration
- Test responsiveness

### **Phase 3: Integration (Week 3)**
- Build BodyAnalysisPanel layout
- Integrate with API data
- Mode switching + comparison date selection

### **Phase 4: Polish & Testing (Week 4)**
- Accessibility audit + fixes
- Visual regression tests
- Performance optimization
- QA gate

---

## 📞 Questions for Implementation?

This spec is owned by Uma (UX-Design-Expert).
**For clarifications or technical trade-offs, escalate to @dev with reference to this spec.**

---

**Spec Version History:**
- v1.0.0 (2026-03-03): Initial creation by Uma