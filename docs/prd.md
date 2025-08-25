# Assured Partners Survey & Reporting Platform Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Enable real-time benefits performance tracking with instant what-if scenario modeling to identify and capture $2.3M in addressable savings opportunities
- Reduce monthly report generation time from 2-3 days to less than 4 hours per client through automated data processing and visualization
- Achieve 95% client retention by transforming Assured Partners from data processor to strategic advisor with proactive insights
- Demonstrate platform value through compelling interactive demo securing unanimous stakeholder approval for continued development
- Deliver 42ms calculation performance showcasing speed advantage over 8-hour Excel analysis workflows
- Enable peer benchmarking through automated cohort comparison based on 5 key dimensions (funding, carrier, plan type, network, size)
- Provide progressive disclosure UI serving both executive quick-views (5 metrics) and analyst deep-dives (full detail)
- Establish foundation for future AI-powered recommendations and predictive analytics capabilities

### Background Context

Healthcare benefits administrators currently operate in reactive mode with 30-45 day data lag, making real-time interventions impossible. Organizations are experiencing average 4.2% PEPM variance ($2.3M addressable across portfolio) with 60% driven by preventable Rx rebate timing issues. The current workflow involves manual CSV collection from 40+ organizations, static PDF reports, and 8-12 hours of Excel analysis per month with no peer comparison capability.

This platform transforms benefits management from reactive reporting to proactive optimization through an integrated Survey and Reporting system. By combining automated data collection with real-time analytical dashboards and instant what-if modeling, organizations can identify cost drivers immediately, test intervention strategies, and benchmark against peers. The solution operates as a continuous feedback loop: collect → analyze → model → optimize → measure, enabling proactive interventions that consistently deliver 3-5% cost savings.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024-01-24 | 1.0 | Initial PRD creation from Project Brief | Sarah (PO) |
| 2024-01-24 | 1.1 | Added MVP demo requirements and epic structure | Sarah (PO) |

## Requirements

### Functional

- **FR1:** The platform shall accept CSV file uploads containing aggregated survey responses from 40+ organizations with instant validation and preview capabilities
- **FR2:** The system shall display an interactive reporting grid showing Month, PEPM Actual, Target PEPM, % Diff, and Variance ($) with drill-down to line items (claims, rebates, stop-loss, admin)
- **FR3:** The platform shall provide instant what-if modeling through interactive sliders for rebate timing adjustment (-2 to +2 months) and employee count sensitivity (±5%)
- **FR4:** The system shall calculate and display a prominent savings opportunity meter showing addressable variance up to $2.3M with transparent calculation methodology
- **FR5:** The platform shall automatically group and compare organizations based on 5 dimensions (funding mechanism, carrier, plan type, network breadth, and size) displaying peer benchmarks
- **FR6:** The system shall implement a unified filter bar that simultaneously controls both Survey and Reporting modules (Client/Org/Plan Type/Carrier/Funding/Network/Month)
- **FR7:** The platform shall provide a guided demo mode with 6-step tooltip walkthrough (Filter → Ticker → Slider → Waterfall → Grid → Export) for stakeholder presentations
- **FR8:** The system shall offer a Focus/Advanced toggle allowing simplified 5-column view for executives vs. full detail grid for analysts
- **FR9:** The platform shall support data export in multiple formats (CSV, PDF, Excel) preserving all calculations and visualizations
- **FR10:** The system shall maintain calculation transparency allowing users to trace any metric from summary to source data
- **FR11:** The platform shall process and store de-identified high-cost claimant data while maintaining HIPAA compliance
- **FR12:** The system shall display performance badges showing calculation speed (target: 42ms) for all interactions

### Non Functional

- **NFR1:** All calculations and page interactions must complete in less than 50ms with visible performance indicators
- **NFR2:** Initial page load time must be under 2 seconds on standard broadband connections
- **NFR3:** The platform must support 10 concurrent users without performance degradation
- **NFR4:** Data grid must render 500 rows in less than 500ms
- **NFR5:** The system must maintain SOC 2 Type II compliance alignment for security practices
- **NFR6:** All data must be encrypted at rest (AES-256) and in transit (TLS 1.3)
- **NFR7:** The platform must support Chrome 90+, Edge 90+, Safari 14+, Firefox 88+ on Windows 10/11 and macOS 11+
- **NFR8:** The system must implement row-level security in preparation for future multi-tenant architecture
- **NFR9:** API endpoints must include rate limiting (100 requests/minute) and DDoS protection
- **NFR10:** The platform must maintain 99.9% uptime during business hours (8 AM - 6 PM EST)
- **NFR11:** All user actions affecting data must be logged for audit trail purposes
- **NFR12:** The system must handle CSV files up to 100MB without timeout or memory issues

## User Interface Design Goals

### Overall UX Vision

Create a data-dense yet approachable interface that transforms complex benefits analytics into actionable insights through progressive disclosure, visual hierarchy, and instant interactivity. The design should inspire confidence through transparency while delighting users with sub-second responsiveness and intelligent defaults.

### Key Interaction Paradigms

- **Progressive Disclosure:** Start simple with executive summary, reveal complexity on demand
- **Direct Manipulation:** Sliders, toggles, and filters provide immediate visual feedback
- **Contextual Intelligence:** "Organizations Like Yours" and smart defaults reduce cognitive load
- **Performance as Feature:** Visible speed badges reinforce platform superiority over Excel
- **Guided Exploration:** Demo mode and tooltips enable self-service learning

### Core Screens and Views

- **Dashboard Home:** Executive summary with Money Meter, key metrics, and quick actions
- **Survey Module:** CSV upload interface with validation feedback and data preview
- **Reporting Grid:** Interactive data table with drill-down, sorting, and filtering
- **What-If Modeling:** Slider panel with real-time recalculation and impact visualization
- **Peer Comparison:** Cohort selection and benchmark overlay interface
- **Export Center:** Format selection and customization options for reports

### Accessibility: WCAG AA

The platform will meet WCAG 2.1 Level AA standards including keyboard navigation, screen reader support, sufficient color contrast (4.5:1 minimum), and focus indicators for all interactive elements.

### Branding

Professional, trustworthy design language emphasizing data clarity and financial precision. Clean typography (Inter or similar), subtle animations for state changes, and a color palette balancing Assured Partners brand guidelines with accessibility requirements. Performance badges and money meters should feel premium without being ostentatious.

### Target Device and Platforms: Web Responsive

Primary optimization for desktop (1920x1080 and 1366x768 resolutions) with responsive scaling for tablets. Mobile view provides read-only access to key metrics and reports. No native mobile applications in MVP scope.

## Technical Assumptions

### Repository Structure: Monorepo

Single repository containing frontend, backend, shared types, and utilities packages. This simplifies initial development, ensures type safety across the stack, and enables atomic commits for features spanning multiple layers.

### Service Architecture

Initial monolithic application with clear module boundaries preparing for future microservices extraction. Core modules include:
- Survey Service (data collection and validation)
- Reporting Service (calculations and aggregations)
- Analytics Engine (what-if modeling and peer comparison)
- Export Service (report generation)

Clean separation of concerns enables future decomposition without major refactoring.

### Testing Requirements

Full testing pyramid implementation:
- **Unit Tests:** 80% coverage for business logic and calculations
- **Integration Tests:** API endpoint testing with database interactions
- **E2E Tests:** Critical user flows (upload → calculate → export)
- **Performance Tests:** Validate 50ms calculation targets
- **Manual Testing Helpers:** Seed data generators and demo mode for QA

### Additional Technical Assumptions and Requests

- **Frontend Stack:** Next.js 14 (App Router), TypeScript, React 18, Tailwind CSS confirmed
- **Backend Stack:** Node.js with Express/Fastify, TypeScript, REST API architecture
- **Database:** PostgreSQL for transactional data, Redis for caching and session management
- **Visualization:** Plotly.js for all charts and data visualizations (30+ chart types)
- **CSV Processing:** PapaParse for client and server-side file handling
- **Deployment:** Containerized with Docker, cloud-agnostic (AWS/Azure/GCP ready)
- **Monitoring:** OpenTelemetry for performance tracking, Sentry for error reporting
- **Security:** OAuth 2.0 ready for future SSO, bcrypt for password hashing
- **API Design:** RESTful with OpenAPI 3.0 documentation
- **State Management:** React Context for global state, React Query for server state
- **Build Tools:** Turbo for monorepo builds, ESBuild for bundling
- **Code Quality:** ESLint, Prettier, Husky for pre-commit hooks
- **CI/CD:** GitHub Actions for testing and deployment automation

## Epic List

**Epic 1: Foundation & MVP Demo Features**
Establish project infrastructure and deliver compelling interactive demo showcasing core value propositions

**Epic 2: Data Processing & Analytics Engine**  
Build robust data ingestion, calculation engine, and what-if modeling capabilities

**Epic 3: Visualization & Reporting**
Create comprehensive visualization suite and export functionality

**Epic 4: Performance & Polish**
Optimize for production scale and enhance user experience

## Epic 1: Foundation & MVP Demo Features

**Goal:** Establish core project infrastructure with authentication, deliver the four must-have demo features (What-If Sliders, Money Meter, Cohort Comparison, Guided Mode), and secure stakeholder approval through a compelling 30-minute demonstration showcasing $2.3M in savings opportunities.

### Story 1.1: Project Foundation & Health Check

As a developer,
I want to establish the foundational project structure with all core dependencies,
so that the team has a solid base for feature development.

**Acceptance Criteria:**
1. Monorepo structure created with packages for frontend, backend, shared types, and utilities
2. Next.js 14 application initialized with TypeScript, Tailwind CSS, and App Router configured
3. Express/Fastify backend with TypeScript setup and basic middleware configured
4. PostgreSQL and Redis connections established with health check endpoints
5. Basic authentication flow implemented with session management
6. Development environment runs successfully with hot reload
7. Simple landing page displays confirming all services are connected
8. Git repository initialized with proper .gitignore and README

### Story 1.2: CSV Upload & Data Model

As a benefits administrator,
I want to upload CSV files containing survey responses,
so that I can import organizational data into the platform.

**Acceptance Criteria:**
1. Drag-and-drop file upload interface accepts CSV files up to 100MB
2. PapaParse integration validates CSV structure and displays preview of first 5 rows
3. Database schema created for organizations, surveys, and reporting data
4. Upload progress indicator shows real-time status
5. Error messages clearly explain validation failures
6. Successfully uploaded data is stored in PostgreSQL
7. Upload history is maintained with timestamps and file metadata

### Story 1.3: Interactive Reporting Grid

As a benefits analyst,
I want to view an interactive data grid with key metrics,
so that I can analyze PEPM variance and drill into details.

**Acceptance Criteria:**
1. Grid displays Month, PEPM Actual, Target PEPM, % Diff, Variance ($) columns
2. Click any row to expand and show line items (claims, rebates, stop-loss, admin)
3. Sorting works on all columns with visual indicators
4. Grid renders 480 rows (40 orgs × 12 months) smoothly
5. Focus/Advanced toggle switches between 5-column and full detail views
6. Column totals and averages display in footer row
7. Grid maintains state when navigating between modules

### Story 1.4: What-If Modeling Sliders

As a benefits administrator,
I want to adjust rebate timing and employee count through sliders,
so that I can instantly see the impact on PEPM and variance.

**Acceptance Criteria:**
1. Rebate timing slider adjusts -2 to +2 months with monthly increments
2. Employee count slider adjusts ±5% with 0.5% increments
3. PEPM recalculates instantly as sliders move (no lag)
4. "42ms" performance badge displays prominently showing calculation speed
5. Original vs. adjusted values show side-by-side for comparison
6. Reset button returns sliders to baseline
7. Slider positions persist when filtering data

### Story 1.5: Big Money Meter

As an executive stakeholder,
I want to see the total savings opportunity prominently displayed,
so that I immediately understand the platform's value.

**Acceptance Criteria:**
1. Large "$2.3M Opportunity" meter displays at top of dashboard
2. Meter updates in real-time based on current filters and what-if scenarios
3. Clicking meter shows calculation transparency (formula and inputs)
4. Animation draws attention when value changes
5. Meter includes trend indicator (up/down arrow) from last period
6. Value formatting includes proper currency symbols and thousand separators
7. Meter remains visible when scrolling through reporting grid

### Story 1.6: Organizations Like Yours

As a benefits analyst,
I want to compare our performance against similar organizations,
so that I can benchmark and identify improvement opportunities.

**Acceptance Criteria:**
1. System automatically identifies 5 most similar organizations based on funding, carrier, plan type, network, and size
2. "Organizations Like Yours" card displays cohort averages for key metrics
3. Overlay option adds peer benchmark lines to reporting grid
4. "Apply as Filter" button filters grid to show only cohort members
5. Similarity algorithm explanation available via info icon
6. Cohort updates when primary filters change
7. Visual indicator shows where organization ranks within cohort

### Story 1.7: Unified Filter Bar

As a platform user,
I want a single filter bar that controls all modules,
so that I maintain context while navigating between views.

**Acceptance Criteria:**
1. Filter bar includes dropdowns for Client, Org, Plan Type, Carrier, Funding, Network, Month
2. Selections in filter bar simultaneously update Survey and Reporting modules
3. Active filters display as removable chips below dropdowns
4. "Clear All" button resets all filters with confirmation
5. Filter state persists when switching between modules
6. URL updates to reflect filter state (shareable links)
7. Filter bar remains sticky at top when scrolling

### Story 1.8: Guided Demo Mode

As a presenter,
I want a guided walkthrough of key features,
so that I can effectively demonstrate the platform to stakeholders.

**Acceptance Criteria:**
1. "Start Demo" button initiates 6-step guided tour
2. Steps progress: Filter → Ticker → Slider → Waterfall → Grid → Export
3. Each step highlights relevant UI element with tooltip explanation
4. Progress indicator shows current step (e.g., "Step 3 of 6")
5. Navigation allows moving forward/backward through steps
6. Demo mode can be exited at any time
7. Final step includes call-to-action for stakeholder feedback

## Epic 2: Data Processing & Analytics Engine

**Goal:** Build a robust calculation engine that processes benefits data accurately, enables complex what-if scenarios, and maintains sub-50ms performance while handling increasing data volumes and calculation complexity.

### Story 2.1: Calculation Engine Core

As a system administrator,
I want a reliable calculation engine for PEPM and variance metrics,
so that all platform calculations are accurate and consistent.

**Acceptance Criteria:**
1. PEPM calculation correctly factors claims, admin fees, and member counts
2. Variance calculations accurately compare actual vs. target with proper percentage math
3. Redis caching layer reduces redundant calculations
4. Calculation service isolated for testing and debugging
5. All calculations include audit trail with inputs and formulas
6. Unit tests cover all calculation scenarios with known outputs
7. Performance logs track calculation times for optimization

### Story 2.2: Rebate Timing Engine

As a benefits analyst,
I want to model rebate timing impacts,
so that I can understand how payment delays affect monthly variance.

**Acceptance Criteria:**
1. Rebate shifting algorithm correctly moves amounts between months
2. Shifted rebates maintain total sum (no money created or lost)
3. Historical rebate patterns inform default timing assumptions
4. Quarterly rebate logic handles standard pharma payment cycles
5. Visual indicator shows which months have shifted rebates
6. Undo/redo functionality for rebate adjustments
7. Rebate impact displays as separate line in variance breakdown

### Story 2.3: Cohort Matching Algorithm

As a data scientist,
I want an intelligent cohort matching system,
so that peer comparisons are meaningful and statistically valid.

**Acceptance Criteria:**
1. K-nearest neighbor algorithm identifies 5 most similar organizations
2. Similarity weights configurable for each dimension (funding, carrier, size, etc.)
3. Minimum cohort size enforced (at least 3 matches required)
4. Statistical significance indicators for cohort comparisons
5. Cohort stability tracked over time (same peers across months)
6. Manual override allows excluding specific organizations
7. Algorithm performance optimized for <100ms execution

### Story 2.4: Advanced Aggregations

As a benefits administrator,
I want multiple aggregation views of the data,
so that I can analyze trends at different levels.

**Acceptance Criteria:**
1. Aggregations available by quarter, year, carrier, plan type, and region
2. Weighted averages account for member months properly
3. Outlier detection flags unusual values in aggregations
4. Drill-through from aggregated to detail data maintains context
5. Custom groupings can be saved and reused
6. Aggregation logic consistent between grid and visualizations
7. Export includes both detail and aggregated views

## Epic 3: Visualization & Reporting

**Goal:** Create compelling data visualizations and comprehensive export capabilities that transform complex benefits data into clear insights, enabling stakeholders to make informed decisions and share findings effectively.

### Story 3.1: Chart Framework Integration

As a developer,
I want to integrate Plotly.js visualization framework,
so that we can create interactive charts and graphs.

**Acceptance Criteria:**
1. Plotly.js integrated with dynamic imports to avoid SSR issues
2. Chart component library created with consistent styling
3. Responsive sizing ensures charts fit containers properly
4. Chart interactions (hover, click, zoom) work smoothly
5. Color palette follows accessibility guidelines
6. Loading states display while charts render
7. Error boundaries prevent chart failures from crashing page

### Story 3.2: Trend Visualizations

As a benefits analyst,
I want to see PEPM trends over time,
so that I can identify patterns and anomalies.

**Acceptance Criteria:**
1. Multi-line chart shows PEPM actual vs. target over 12 months
2. Toggle individual series on/off via legend
3. Hover displays detailed values at each point
4. Annotations mark significant events (rebate receipt, plan changes)
5. Zoom and pan functionality for detailed examination
6. Trend lines and moving averages can be overlaid
7. Chart exports as PNG/SVG with current view

### Story 3.3: Variance Waterfall Chart

As an executive,
I want to see variance broken down by component,
so that I understand what's driving cost differences.

**Acceptance Criteria:**
1. Waterfall chart shows progression from target to actual PEPM
2. Each bar represents a variance component (Rx, medical, admin, stop-loss)
3. Positive/negative values use distinct colors
4. Hover shows exact values and percentages
5. Bars can be clicked to filter grid to related items
6. Chart updates instantly with filter changes
7. Subtotals display at logical breakpoints

### Story 3.4: Export Engine

As a benefits administrator,
I want to export data and reports in multiple formats,
so that I can share insights with stakeholders.

**Acceptance Criteria:**
1. Export formats include CSV, Excel, and PDF
2. Exports preserve current filters and calculations
3. PDF exports include charts and formatted tables
4. Excel exports maintain formulas for further analysis
5. Scheduled exports can be configured for recurring reports
6. Export queue handles large requests without blocking UI
7. Email notification when export is ready (with download link)

### Story 3.5: Executive Dashboard

As an executive stakeholder,
I want a high-level dashboard view,
so that I can quickly assess performance without drilling into details.

**Acceptance Criteria:**
1. Dashboard displays Money Meter, key metrics, and trend sparklines
2. Traffic light indicators (red/yellow/green) for variance thresholds
3. Top 5 cost drivers listed with impact amounts
4. YoY and MoM comparison percentages shown
5. Print-friendly layout for board presentations
6. Auto-refresh option for display screens
7. Customizable metric cards via drag-and-drop

## Epic 4: Performance & Polish

**Goal:** Optimize platform performance to consistently achieve sub-50ms response times, enhance user experience with quality-of-life improvements, and ensure production readiness through comprehensive testing and monitoring.

### Story 4.1: Performance Optimization

As a platform user,
I want consistently fast response times,
so that my workflow isn't interrupted by loading delays.

**Acceptance Criteria:**
1. Database queries optimized with proper indexes
2. Redis caching strategy implemented for frequent queries
3. Frontend code splitting reduces initial bundle size below 200KB
4. API responses compressed with gzip/brotli
5. CDN configured for static assets
6. Performance monitoring dashboard tracks key metrics
7. Load testing validates 10 concurrent users without degradation

### Story 4.2: Error Handling & Recovery

As a platform user,
I want graceful error handling,
so that I can recover from issues without losing work.

**Acceptance Criteria:**
1. All errors display user-friendly messages with suggested actions
2. Form data persists locally to prevent loss on error
3. Retry logic implemented for transient network failures
4. Error boundaries prevent component failures from crashing app
5. Support contact information included in error messages
6. Error logs captured for debugging without exposing sensitive data
7. Offline mode displays cached data when connection lost

### Story 4.3: Search & Filter Enhancement

As a benefits analyst,
I want powerful search and filter capabilities,
so that I can quickly find specific data points.

**Acceptance Criteria:**
1. Global search bar searches across all data fields
2. Search highlights matching terms in results
3. Advanced filter panel with multiple condition support
4. Saved filter sets can be named and reused
5. Filter suggestions based on common patterns
6. Quick filters for common queries (e.g., "High Variance", "Missing Rebates")
7. Search/filter state included in shareable URLs

### Story 4.4: User Preferences & Customization

As a regular user,
I want to customize my platform experience,
so that it matches my workflow preferences.

**Acceptance Criteria:**
1. User preferences persist between sessions
2. Default filters can be set per user
3. Grid column order/visibility customizable
4. Preferred export format remembered
5. Theme selection (light/dark mode) available
6. Notification preferences configurable
7. Custom shortcuts for frequent actions

### Story 4.5: Production Readiness

As a system administrator,
I want production-ready infrastructure,
so that the platform runs reliably at scale.

**Acceptance Criteria:**
1. Comprehensive test suite achieves 80% code coverage
2. CI/CD pipeline runs tests and deploys automatically
3. Monitoring alerts configured for critical metrics
4. Backup and recovery procedures documented and tested
5. Security scan passes with no critical vulnerabilities
6. API documentation complete with OpenAPI spec
7. Runbook created for common operational tasks

## Checklist Results Report

*[To be completed after PM checklist execution]*

## Next Steps

### UX Expert Prompt

"Please review this PRD for the Assured Partners Survey & Reporting Platform and create detailed UI/UX specifications focusing on the data-dense dashboard, interactive reporting grid, and what-if modeling interfaces. Prioritize clarity in data visualization and sub-second interaction feedback."

### Architect Prompt

"Please create the technical architecture for this PRD using the specified stack (Next.js 14, TypeScript, PostgreSQL, Redis). Focus on achieving sub-50ms calculation performance and preparing for future microservices extraction. The architecture must support the immediate demo requirements while establishing patterns for long-term scalability."

---

*PRD Version 1.1 - Created by Sarah (Product Owner)*
*Date: January 24, 2024*
*Status: Ready for Architecture Phase*