# Lovable/V0 UI Generation Prompt - Assured Partners Survey & Reporting Platform

## Master Prompt for AI Frontend Generation

Copy the following prompt into Lovable.ai, V0, or similar AI frontend tool:

```
## High-Level Goal
Create a responsive, data-dense financial analytics dashboard for the Assured Partners Survey & Reporting Platform with real-time what-if modeling, peer benchmarking, and a compelling $2.3M opportunity visualization. The platform must demonstrate sub-50ms calculation performance and support a 30-minute stakeholder demo showcasing immediate ROI.

## Project Context & Foundation

### Tech Stack Requirements
- Framework: Next.js 14 with App Router
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS with custom design tokens
- State: React Context + React Query for server state
- Animations: Framer Motion for all interactions
- Charts: Plotly.js for 30+ visualization types
- Data Processing: PapaParse for CSV handling
- Icons: Lucide React (24px, 2px stroke)
- UI Primitives: Radix UI for accessibility

### Brand & Visual Style
- Primary Color: #003D7A (Assured Partners Blue)
- Secondary: #0066CC (Interactive Blue)
- Success: #00A86B (Positive Variance Green)
- Error: #EF4444 (Negative Variance Red)
- Font Stack: Inter for UI, JetBrains Mono for numbers
- Spacing: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)
- Border Radius: 8px for cards, 4px for inputs
- Shadows: Subtle elevation (0 1px 3px rgba(0,0,0,0.12))

## Detailed Component Instructions

### 1. Create the Main Dashboard Layout (`app/dashboard/page.tsx`)

Build a three-zone dashboard layout:
- **Top Zone**: Unified FilterBar (sticky, glass morphism effect)
- **Hero Zone**: MoneyMeter showing $2,346,892 opportunity (animated counter)
- **Content Zone**: Two-column layout with ReportingGrid (left, 70%) and WhatIfPanel (right, 30%)

Mobile: Stack all zones vertically, hide WhatIfPanel in drawer
Tablet: Two-column becomes single column
Desktop: Full three-zone layout with 1440px max width

### 2. Build the MoneyMeter Component (`components/MoneyMeter.tsx`)

Create a hero metric component that:
1. Displays large currency value with 3-second count-up animation
2. Uses Framer Motion: animate from 0 to $2,346,892 with easeOutExpo
3. Shows "42ms" performance badge in corner (pulse animation)
4. Includes trend arrow (up/down) with percentage change
5. Click reveals calculation transparency modal
6. Green glow effect when value increases
7. Responsive sizes: 72px (desktop), 48px (tablet), 36px (mobile)

```typescript
// Animation config
const countAnimation = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Counter logic
const animateValue = (start: number, end: number, duration: number) => {
  // Use requestAnimationFrame for smooth counting
  // Apply easeOutExpo: 1 - Math.pow(2, -10 * progress)
};
```

### 3. Implement the ReportingGrid Component (`components/ReportingGrid.tsx`)

Build an interactive data table with:
1. Columns: Month | PEPM Actual | Target PEPM | % Diff | Variance ($)
2. Row expansion on click showing line items (Medical, Rx, Admin, Stop-Loss)
3. Virtual scrolling for 480+ rows using @tanstack/react-virtual
4. Column sorting with visual indicators (chevron icons)
5. Footer row with totals and averages
6. Focus/Advanced toggle (5 columns vs full detail)
7. Skeleton loading state with shimmer effect
8. Cell formatting: Currency with thousand separators, percentages with +/- indicators

Responsive behavior:
- Mobile: Horizontal scroll with frozen first column
- Tablet: Show 3 primary columns, expand for details
- Desktop: All columns visible, hover states enabled

### 4. Create the WhatIfPanel Component (`components/WhatIfPanel.tsx`)

Build an interactive modeling panel:
1. Employee Count Slider: -5% to +5% range, 0.5% steps
2. Visual impact display: Original vs Adjusted values side-by-side
3. Real-time PEPM recalculation as slider moves
4. Reset button with confirmation tooltip
5. Impact summary card showing dollar difference
6. Use Framer Motion spring physics for slider handle

```typescript
// Slider configuration
const sliderConfig = {
  min: -5,
  max: 5,
  step: 0.5,
  defaultValue: 0,
  marks: [-5, -2.5, 0, 2.5, 5],
  formatLabel: (value) => `${value > 0 ? '+' : ''}${value}%`
};
```

### 5. Build the FilterBar Component (`components/FilterBar.tsx`)

Create a unified filtering system:
1. Dropdowns: Client | Organization | Plan Type | Carrier | Funding | Network | Month
2. Multi-select capability with checkbox dropdowns
3. Active filters display as removable chips below
4. "Clear All" button with sweep animation
5. Filter state syncs to URL params for sharing
6. Loading state while filters apply
7. Result count badge showing filtered records

Mobile: Collapse into filter button opening full-screen drawer
Tablet: Two-row layout with primary filters visible
Desktop: Single row with all filters

### 6. Implement the DemoMode Overlay (`components/DemoMode.tsx`)

Create a guided tour system:
1. 6-step walkthrough with spotlight effect (darken background, highlight target)
2. Steps: Filter → MoneyMeter → WhatIf → Waterfall → Grid → Export
3. Floating tooltip with step description and "Next" button
4. Progress dots indicator (1 of 6)
5. Keyboard navigation (Arrow keys, ESC to exit)
6. Pulse animation on target elements
7. Auto-advance option with 5-second timer

### 7. Create the PeerComparison Component (`components/PeerComparison.tsx`)

Build a benchmarking card:
1. Title: "Organizations Like Yours"
2. Auto-selected 5 similar orgs based on dimensions
3. Metrics comparison table with sparklines
4. "Your Rank: 3 of 5" badge
5. "Apply as Filter" action button
6. Similarity score explanation on hover

### 8. Add the PerformanceBadge Component (`components/PerformanceBadge.tsx`)

Create a performance indicator:
1. Shows calculation time in milliseconds
2. Color coding: Green (<50ms), Yellow (50-100ms), Red (>100ms)
3. Subtle pulse animation on update
4. Click to show performance breakdown
5. Position: Fixed bottom-right corner

## Data Structures & API Contracts

```typescript
// Core data types
interface Organization {
  id: string;
  name: string;
  employees: number;
  carrier: string;
  planType: 'PPO' | 'HMO' | 'HDHP';
  fundingType: 'Self-Funded' | 'Fully-Insured';
  network: 'Broad' | 'Narrow';
}

interface MonthlyMetrics {
  month: string;
  pepmActual: number;
  pepmTarget: number;
  variance: number;
  percentDiff: number;
  lineItems: {
    medical: number;
    pharmacy: number;
    admin: number;
    stopLoss: number;
  };
}

interface WhatIfScenario {
  employeeAdjustment: number; // percentage
  originalPepm: number;
  adjustedPepm: number;
  impact: number;
}

// API Endpoints (REST)
GET /api/organizations
GET /api/metrics?orgId={id}&month={month}
POST /api/calculate-whatif
GET /api/peer-comparison?orgId={id}
POST /api/upload-csv
GET /api/export?format={csv|pdf|excel}
```

## Constraints & Important Notes

### DO NOT:
- Add authentication screens (handled separately)
- Create backend API implementations (frontend only)
- Include real customer data (use demo data)
- Add unnecessary animations that impact performance
- Create custom chart libraries (use Plotly.js)
- Implement complex state management (keep it simple)
- Add features beyond the 8 components listed

### MUST INCLUDE:
- Skeleton loading states for all data fetching
- Error boundaries with user-friendly messages
- Responsive breakpoints (320px, 768px, 1024px, 1440px)
- Keyboard navigation support
- ARIA labels for accessibility
- Performance optimization (memo, lazy loading)
- TypeScript strict mode compliance

### Demo Data Requirements:
Generate realistic demo data showing:
- 40 organizations with varying metrics
- 12 months of historical data
- PEPM values ranging from $420-$580
- Variance highlighting $2.3M opportunity
- Mix of positive and negative variances
- Calculation completing in exactly 42ms

## Scope Definition

You should ONLY create the 8 components listed above and their integration into the main dashboard page. Do NOT create:
- Login/authentication pages
- User management interfaces  
- Backend API routes
- Database schemas
- Admin panels
- Settings pages
- Help documentation

Focus exclusively on the dashboard and demo experience that will secure stakeholder approval.

## Mobile-First Implementation Order

1. Start with mobile FilterBar (drawer pattern)
2. Build mobile MoneyMeter (simplified, centered)
3. Create mobile ReportingGrid (horizontal scroll)
4. Add tablet breakpoint adjustments
5. Enhance for desktop with hover states
6. Add animations last (respect prefers-reduced-motion)

Remember: This code will be refined by developers. Focus on creating a visually compelling, interactive prototype that demonstrates the core value proposition and can be presented to stakeholders tomorrow.
```

## Usage Instructions

1. **Copy the entire prompt above** into your AI frontend tool (Lovable.ai, V0, or similar)

2. **If using Lovable.ai**: 
   - Paste the prompt and click "Generate"
   - Review the preview and iterate with specific refinements
   - Export the code when satisfied

3. **If using Vercel V0**:
   - Start with the dashboard layout first
   - Then prompt for individual components
   - Use the "Edit" feature to refine specific aspects

4. **Component-by-Component Approach** (Recommended):
   - Start with just the MoneyMeter component
   - Test and refine it
   - Move to the next component
   - Build incrementally for best results

## Important Reminders

- **Review All Generated Code**: AI-generated code requires careful review for security, performance, and correctness
- **Test Thoroughly**: Ensure all interactions work as expected, especially the demo mode
- **Optimize Performance**: Monitor actual calculation times and optimize as needed
- **Accessibility Check**: Verify WCAG AA compliance with automated tools
- **Demo Preparation**: Practice the 6-step demo flow before the stakeholder presentation

## Next Steps After Generation

1. Install required dependencies:
```bash
npm install framer-motion plotly.js papaparse @tanstack/react-virtual lucide-react @radix-ui/react-* 
```

2. Configure TypeScript strict mode in `tsconfig.json`

3. Set up demo data in `/data/demo.json`

4. Test the complete demo flow end-to-end

5. Prepare presenter notes for each demo step

---

*Generated for Assured Partners Survey & Reporting Platform*  
*Demo Date: January 25, 2024*  
*Status: Ready for AI Generation*