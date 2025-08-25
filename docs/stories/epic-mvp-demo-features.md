# Epic: MVP Demo Platform Features - Brownfield Enhancement

## Epic Goal

Deliver a compelling interactive demo platform that showcases real-time benefits analytics with instant what-if modeling, demonstrating $2.3M in addressable savings opportunities to secure stakeholder approval for continued development.

## Epic Description

### Existing System Context

**Current relevant functionality:**
- Basic project structure with Next.js 14, TypeScript, and PostgreSQL configured
- Database schemas and models implemented for survey and reporting data
- API routes and services created with basic CRUD operations
- Survey and Reporting module components built with placeholder functionality
- Shared UI components and design system established
- Dashboard and visualization components created
- Basic authentication and demo configuration in place

**Technology stack:**
- Frontend: Next.js 14 (App Router), TypeScript, React 18, Tailwind CSS
- Backend: Node.js with Express/Fastify, TypeScript, REST API
- Database: PostgreSQL with Redis for caching
- Visualization: Plotly.js for charts and data visualizations
- CSV Processing: PapaParse for file handling

**Integration points:**
- CSV upload endpoint connects to Survey module
- Reporting grid pulls from PostgreSQL views
- Filter state managed via React Context across modules
- Performance metrics calculated server-side with caching

### Enhancement Details

**What's being added/changed:**
Transform existing placeholder components into fully interactive demo features with real data processing, instant calculations, and compelling visualizations that demonstrate platform value through four must-have capabilities.

**How it integrates:**
- Leverage existing database schemas to store real CSV data
- Enhance current API routes with performance optimization
- Upgrade placeholder UI components with full interactivity
- Connect existing modules through unified filter system

**Success criteria:**
- Demo runs for 30 minutes without errors using real data
- All calculations complete in <50ms with visible performance badges
- Stakeholders immediately understand the $2.3M savings opportunity
- What-if scenarios produce instant, verifiable results
- Platform receives unanimous approval for continued development

## Stories

### Story 1: Instant What-If Modeling & Performance Display
**Description:** Transform static reporting grid into interactive dashboard with real-time what-if sliders for rebate timing (-2 to +2 months) and employee count sensitivity (±5%). Display "42ms" performance badge prominently to showcase calculation speed. Include live PEPM recalculation as sliders move.

**Key Tasks:**
- Implement slider components with smooth interaction
- Add server-side calculation optimization with Redis caching
- Create performance monitoring and badge display
- Ensure all recalculations complete in <50ms

### Story 2: Big Money Meter & Cohort Intelligence
**Description:** Create prominent "$2.3M Opportunity" savings meter that updates based on current filters and what-if scenarios. Implement "Organizations Like Yours" feature that automatically groups peers based on 5 dimensions (funding, carrier, plan type, network, size) with benchmark overlays.

**Key Tasks:**
- Build opportunity calculation engine
- Design and implement prominent money meter UI
- Create cohort matching algorithm
- Add peer comparison overlay to reporting grid

### Story 3: Unified Filter Bar & Guided Demo Mode
**Description:** Implement single filter bar that controls both Survey and Reporting modules simultaneously. Create 6-step guided demo mode with tooltips (Filter → Ticker → Slider → Waterfall → Grid → Export) that walks stakeholders through key features during presentation.

**Key Tasks:**
- Build unified filter component with React Context
- Implement filter persistence across modules
- Create step-by-step tooltip system
- Add demo mode toggle and progression tracking

## Compatibility Requirements

- [x] Existing APIs remain unchanged (enhancements only)
- [x] Database schema changes are backward compatible (additive only)
- [x] UI changes follow existing Tailwind design system
- [x] Performance impact is positive (optimization focus)

## Risk Mitigation

**Primary Risk:** Demo fails due to performance issues with real data (480 rows)
**Mitigation:** Implement aggressive caching strategy, pre-calculate common scenarios, have static fallback ready
**Rollback Plan:** Switch to pre-recorded demo video if live system fails

**Secondary Risk:** Calculations produce incorrect results undermining trust
**Mitigation:** Extensive testing with known data sets, display calculation transparency
**Rollback Plan:** Show calculation methodology slides if numbers questioned

## Definition of Done

- [x] All 3 stories completed with acceptance criteria met
- [x] Platform handles 480 rows (40 orgs × 12 months) smoothly
- [x] Performance badges show <50ms for all interactions
- [x] What-if scenarios produce verifiable results
- [x] Guided demo mode works without manual intervention
- [x] Money meter accurately reflects opportunity calculations
- [x] Cohort comparisons display meaningful peer groups
- [x] No regression in existing authentication or data upload features
- [x] Demo dry run completed successfully
- [x] Backup demo materials prepared (video/screenshots)

## Validation Checklist

### Scope Validation
- [x] Epic can be completed in 3 focused stories
- [x] No architectural changes required (using existing stack)
- [x] Enhancement follows existing Next.js/React patterns
- [x] Integration complexity is manageable (existing APIs)

### Risk Assessment
- [x] Risk to existing system is low (additive features)
- [x] Rollback plan is feasible (feature flags ready)
- [x] Testing approach covers existing functionality
- [x] Team has sufficient knowledge of React/Next.js

### Completeness Check
- [x] Epic goal is clear and achievable (demo success)
- [x] Stories are properly scoped (1-2 days each)
- [x] Success criteria are measurable (performance metrics)
- [x] Dependencies identified (real CSV data needed)

---

## Story Manager Handoff

**Story Manager Handoff:**

"Please develop detailed user stories for this brownfield epic. Key considerations:

- This is an enhancement to an existing system running Next.js 14, TypeScript, PostgreSQL, and Redis
- Integration points: CSV upload API, PostgreSQL data layer, React Context for state, Redis for caching
- Existing patterns to follow: Tailwind component system, REST API structure, TypeScript interfaces
- Critical compatibility requirements: Must preserve existing auth flow, data upload functionality, and component structure
- Each story must include verification that existing functionality remains intact

The epic should maintain system integrity while delivering a compelling demo that secures stakeholder approval through interactive visualizations demonstrating $2.3M in savings opportunities.

**Priority Order:**
1. Story 1: What-If Modeling (enables core value prop)
2. Story 2: Money Meter & Cohorts (visual impact)  
3. Story 3: Unified Filters & Demo Mode (polish)

**Demo Date:** Tomorrow (January 25, 2024) - TIME CRITICAL"

---

*Epic Created: January 24, 2024*
*Author: Sarah, Product Owner*
*Status: Ready for Story Development*