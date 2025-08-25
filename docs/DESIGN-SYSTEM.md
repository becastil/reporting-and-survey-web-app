# Design System & Component Library

## Document Purpose
This document defines the comprehensive design system for the Assured Partners Survey & Reporting Platform, ensuring visual consistency, accessibility, and maintainable component patterns across the application.

## Design Principles

### Core Tenets
1. **Data Density with Clarity** - Show maximum information without overwhelming
2. **Progressive Disclosure** - Start simple, reveal complexity on demand
3. **Performance as UX** - Speed indicators reinforce platform superiority
4. **Trust Through Transparency** - Show calculations and data sources
5. **Delightful Interactions** - Subtle animations that feel premium

## Visual Language

### Color System

#### Brand Colors
```scss
// Primary Palette
$brand-primary: #003D7A;        // Assured Partners Blue
$brand-secondary: #0066CC;      // Interactive Blue
$brand-dark: #002850;           // Hover/Active Blue
$brand-light: #E6F0FF;          // Background Blue

// Status Colors
$status-success: #00A86B;       // Positive Variance
$status-error: #EF4444;         // Negative Variance
$status-warning: #F59E0B;       // Attention Required
$status-info: #0066CC;          // Information

// Variance Colors
$variance-positive: #00A86B;    // Green (savings)
$variance-negative: #EF4444;    // Red (overspend)
$variance-neutral: #6B7280;     // Gray (no change)

// Neutral Scale
$gray-50: #F9FAFB;
$gray-100: #F3F4F6;
$gray-200: #E5E7EB;
$gray-300: #D1D5DB;
$gray-400: #9CA3AF;
$gray-500: #6B7280;
$gray-600: #4B5563;
$gray-700: #374151;
$gray-800: #1F2937;
$gray-900: #111827;
```

#### Color Usage Guidelines
- **Primary Actions**: Brand Primary (#003D7A)
- **Secondary Actions**: Brand Secondary (#0066CC)
- **Success States**: Status Success with 10% opacity background
- **Error States**: Status Error with 10% opacity background
- **Data Visualization**: Use variance colors for financial metrics
- **Text Hierarchy**: Gray-900 (primary), Gray-600 (secondary), Gray-400 (disabled)

### Typography

#### Font Stack
```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Consolas', monospace;
```

#### Type Scale
```scss
// Display
$display-xl: 72px;  // Line height: 90px, Weight: 700
$display-lg: 60px;  // Line height: 72px, Weight: 700
$display-md: 48px;  // Line height: 60px, Weight: 600

// Headings
$heading-1: 36px;   // Line height: 44px, Weight: 600
$heading-2: 30px;   // Line height: 38px, Weight: 600
$heading-3: 24px;   // Line height: 32px, Weight: 500
$heading-4: 20px;   // Line height: 28px, Weight: 500
$heading-5: 18px;   // Line height: 26px, Weight: 500

// Body
$body-lg: 18px;     // Line height: 28px, Weight: 400
$body-md: 16px;     // Line height: 24px, Weight: 400
$body-sm: 14px;     // Line height: 20px, Weight: 400
$body-xs: 12px;     // Line height: 16px, Weight: 400

// Special
$label: 14px;       // Line height: 20px, Weight: 500, Letter spacing: 0.025em
$caption: 12px;     // Line height: 16px, Weight: 400, Letter spacing: 0.025em
$overline: 10px;    // Line height: 16px, Weight: 600, Letter spacing: 0.1em, Uppercase
```

#### Usage Patterns
- **Money Values**: JetBrains Mono, Display size for hero metrics
- **Data Tables**: Inter, Body-sm for cells, Label for headers
- **Navigation**: Inter, Body-md, Weight 500
- **Buttons**: Inter, Body-sm, Weight 500, Letter spacing 0.025em

### Spacing System

#### Base Unit: 4px
```scss
$space-1: 4px;
$space-2: 8px;
$space-3: 12px;
$space-4: 16px;
$space-5: 20px;
$space-6: 24px;
$space-8: 32px;
$space-10: 40px;
$space-12: 48px;
$space-16: 64px;
$space-20: 80px;
$space-24: 96px;
```

#### Component Spacing
- **Card Padding**: 24px (desktop), 16px (mobile)
- **Section Spacing**: 48px between major sections
- **Form Fields**: 24px between groups, 12px between fields
- **Button Padding**: 16px horizontal, 10px vertical
- **Grid Gaps**: 24px (desktop), 16px (tablet), 12px (mobile)

### Elevation & Shadows

```scss
// Elevation Levels
$shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.15);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);
$shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

// Special Effects
$shadow-focus: 0 0 0 3px rgba(0, 61, 122, 0.2);
$shadow-glow-success: 0 0 20px rgba(0, 168, 107, 0.3);
$shadow-glow-error: 0 0 20px rgba(239, 68, 68, 0.3);
```

### Border System

```scss
$border-radius-sm: 4px;     // Inputs, small buttons
$border-radius-md: 8px;     // Cards, modals
$border-radius-lg: 12px;    // Large cards
$border-radius-xl: 16px;    // Hero sections
$border-radius-full: 9999px; // Pills, badges

$border-width: 1px;
$border-color: $gray-200;
$border-color-hover: $gray-300;
$border-color-focus: $brand-primary;
```

## Component Patterns

### Button Hierarchy

#### Primary Button
```tsx
<Button variant="primary" size="md">
  Calculate Savings
</Button>
```
- Background: Brand Primary
- Text: White
- Hover: Darken 10%
- Focus: Shadow-focus
- Disabled: 50% opacity

#### Secondary Button
```tsx
<Button variant="secondary" size="md">
  View Details
</Button>
```
- Background: Brand Light
- Text: Brand Primary
- Border: 1px Brand Primary
- Hover: Brand Primary background, white text

#### Ghost Button
```tsx
<Button variant="ghost" size="md">
  Cancel
</Button>
```
- Background: Transparent
- Text: Gray-600
- Hover: Gray-100 background

### Form Controls

#### Input Field
```tsx
<div className="form-group">
  <Label htmlFor="org-name">Organization Name</Label>
  <Input 
    id="org-name"
    placeholder="Enter organization name"
    className={error ? 'error' : ''}
  />
  {error && <ErrorMessage>{error}</ErrorMessage>}
</div>
```

#### Select Dropdown
```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose carrier" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="bcbs">Blue Cross Blue Shield</SelectItem>
    <SelectItem value="aetna">Aetna</SelectItem>
  </SelectContent>
</Select>
```

### Data Display

#### Money Display
```tsx
<MoneyValue
  value={2346892}
  size="hero"              // hero | large | medium | small
  showCents={false}
  trend="up"               // up | down | neutral
  trendValue={12.5}
/>
// Output: $2,346,892 ↑ 12.5%
```

#### Performance Badge
```tsx
<PerformanceBadge
  value={42}
  unit="ms"
  status="success"         // success | warning | error
  animated={true}
/>
// Shows: "42ms" with pulse animation
```

#### Data Grid Cell
```tsx
<GridCell
  type="currency"          // currency | percentage | number | text
  value={156234}
  variance="positive"      // positive | negative | neutral
/>
```

### Loading States

#### Skeleton Patterns
```tsx
// Table Skeleton
<SkeletonTable rows={5} columns={5} />

// Card Skeleton
<SkeletonCard />

// Dashboard Skeleton
<SkeletonDashboard />
```

#### Progress Indicators
```tsx
// Linear Progress
<Progress value={65} max={100} />

// Circular Progress
<CircularProgress size="sm" />

// Step Progress
<StepProgress current={2} total={6} />
```

### Feedback Patterns

#### Toast Notifications
```tsx
toast.success("Calculation complete", {
  description: "Saved $2.3M identified",
  action: {
    label: "View Details",
    onClick: () => {}
  }
});
```

#### Empty States
```tsx
<EmptyState
  icon={<FileX />}
  title="No data available"
  description="Upload a CSV file to begin analysis"
  action={
    <Button>Upload CSV</Button>
  }
/>
```

## Animation Guidelines

### Timing Functions
```scss
$ease-in: cubic-bezier(0.4, 0, 1, 1);
$ease-out: cubic-bezier(0, 0, 0.2, 1);
$ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
$ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
$ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Duration Scale
```scss
$duration-instant: 100ms;   // Hover states
$duration-fast: 200ms;      // Micro-interactions
$duration-normal: 300ms;    // Standard transitions
$duration-slow: 500ms;      // Complex animations
$duration-hero: 3000ms;     // Money Meter counter
```

### Animation Patterns
- **Enter**: Fade in + slide up 20px
- **Exit**: Fade out + scale to 0.95
- **Loading**: Pulse or shimmer
- **Success**: Glow green + scale 1.05
- **Error**: Shake horizontally
- **Focus**: Ring expands from center

## Responsive Breakpoints

```scss
$breakpoint-sm: 640px;   // Mobile landscape
$breakpoint-md: 768px;   // Tablet portrait
$breakpoint-lg: 1024px;  // Tablet landscape
$breakpoint-xl: 1280px;  // Desktop
$breakpoint-2xl: 1536px; // Large desktop

// Container max-widths
$container-sm: 640px;
$container-md: 768px;
$container-lg: 1024px;
$container-xl: 1280px;
$container-2xl: 1440px;  // Design max-width
```

### Responsive Behavior

#### Mobile First
```scss
// Base (mobile)
.component {
  padding: 16px;
  font-size: 14px;
}

// Tablet
@media (min-width: 768px) {
  .component {
    padding: 20px;
    font-size: 16px;
  }
}

// Desktop
@media (min-width: 1024px) {
  .component {
    padding: 24px;
    font-size: 18px;
  }
}
```

## Accessibility Patterns

### Focus Management
```scss
// Focus visible styles
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 61, 122, 0.2);
}

// Skip links
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 999;
  
  &:focus {
    top: 0;
  }
}
```

### ARIA Patterns
```tsx
// Live Region for updates
<div aria-live="polite" aria-atomic="true">
  {updateMessage}
</div>

// Loading state
<div aria-busy="true" aria-label="Loading data">
  <Spinner />
</div>

// Error state
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

## Icon System

### Icon Guidelines
- **Size**: 24px default, 20px small, 32px large
- **Stroke**: 2px width
- **Color**: Inherit from text color
- **Library**: Lucide React for consistency

### Common Icons
```tsx
import {
  FileUp,        // Upload
  Download,      // Export
  Filter,        // Filter
  ChevronDown,   // Expand
  TrendingUp,    // Positive
  TrendingDown,  // Negative
  AlertCircle,   // Warning
  CheckCircle,   // Success
  XCircle,       // Error
  RefreshCw,     // Refresh
  Settings,      // Settings
  HelpCircle,    // Help
} from 'lucide-react';
```

## Component Library Structure

```
src/components/
├── ui/                  # Base components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── data-display/        # Data visualization
│   ├── MoneyMeter.tsx
│   ├── ReportingGrid.tsx
│   ├── VarianceChart.tsx
│   └── ...
├── feedback/            # User feedback
│   ├── Toast.tsx
│   ├── Alert.tsx
│   ├── EmptyState.tsx
│   └── ...
├── forms/               # Form components
│   ├── FilterBar.tsx
│   ├── CSVUpload.tsx
│   ├── WhatIfSliders.tsx
│   └── ...
└── layout/              # Layout components
    ├── Dashboard.tsx
    ├── Header.tsx
    ├── Sidebar.tsx
    └── ...
```

## Design Tokens

```typescript
// tokens/index.ts
export const tokens = {
  colors: {
    brand: {
      primary: '#003D7A',
      secondary: '#0066CC',
      // ...
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    // ...
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      // ...
    }
  },
  animation: {
    duration: {
      instant: '100ms',
      fast: '200ms',
      // ...
    }
  }
};
```

## Quality Checklist

### Component Review
- [ ] Follows design system colors
- [ ] Uses consistent spacing
- [ ] Includes all responsive breakpoints
- [ ] Has loading, error, and empty states
- [ ] Meets WCAG AA accessibility
- [ ] Includes Storybook story
- [ ] Has unit tests
- [ ] Documentation complete

### Visual QA
- [ ] Consistent with brand guidelines
- [ ] Animations feel smooth
- [ ] Touch targets are 44x44px minimum
- [ ] Color contrast passes 4.5:1
- [ ] Focus states visible
- [ ] Print styles defined
- [ ] Dark mode considered

---

**Document Owner:** Design Lead
**Last Updated:** January 2025
**Next Review:** Monthly
**Design System Version:** 1.0.0