# Demo Playbook & Presentation Guide

## Document Purpose
This comprehensive guide ensures consistent, impactful demonstrations of the Assured Partners Survey & Reporting Platform, with specific flows, talking points, and contingency plans.

## Pre-Demo Checklist

### 48 Hours Before Demo
- [ ] Run full test suite: `npm run test:demo-validation`
- [ ] Update demo data to current month
- [ ] Test on demo hardware/network
- [ ] Review client background and pain points
- [ ] Customize talking points for audience
- [ ] Prepare offline backup (screenshots/video)

### 1 Hour Before Demo
- [ ] Clear browser cache and cookies
- [ ] Close unnecessary applications
- [ ] Set screen resolution to 1920x1080
- [ ] Enable Do Not Disturb mode
- [ ] Open backup slides in separate window
- [ ] Load demo environment: https://demo.assuredpartners.com
- [ ] Verify feature flags: All enabled for demo
- [ ] Pre-warm cache: Click through main flows once

### Network Contingency
```bash
# If network issues detected:
npm run demo:offline  # Switches to local data
```

## The 15-Minute Power Demo

### Opening (1 minute)
**Presenter Script:**
> "Today, I'll show you how Assured Partners transforms mountains of survey data into actionable insights that save our clients millions. In the next 15 minutes, you'll see exactly how we turn a 1,200-column CSV into clear financial recommendations."

**Action:** Show landing page with Money Meter displaying $2,346,892

### Act 1: The Problem (2 minutes)

**Talking Points:**
- "Most organizations drown in data but starve for insights"
- "Current process: 3 weeks from survey to report"
- "Error-prone manual calculations risk compliance"

**Demo Actions:**
1. Show cluttered Excel screenshot (backup slide)
2. Highlight pain: "This is what analysts deal with daily"
3. Transition: "Let me show you a better way..."

### Act 2: The Magic Upload (3 minutes)

**Presenter Script:**
> "Watch how we transform chaos into clarity in seconds..."

**Demo Flow:**
1. Navigate to Survey module
2. Drag and drop `demo-survey-1200-cols.csv`
3. **Key Moment:** Real-time validation appears
   - Point out: "Notice the instant validation"
   - Highlight: "1,245 rows, 0 errors, 3 warnings"
4. Click "Process Data"
5. **Wow Factor:** Progress bar with live processing stats
6. Auto-redirect to dashboard

**Contingency:** If upload fails, say "Let me show you yesterday's processed data" and navigate directly to dashboard

### Act 3: The Money Shot (4 minutes)

**Presenter Script:**
> "Here's where the magic happens. This number—$2,346,892—is your total savings opportunity, calculated across all variance categories."

**Demo Flow:**
1. **Money Meter Animation** (wait for gasp)
   - Let the number climb dramatically
   - Point to performance badge: "Calculated in 42ms"
   
2. **What-If Sliders** (the interactive moment)
   - Adjust employee count by 2.5%
   - Say: "What if your headcount grows?"
   - Watch Money Meter update instantly
   - Show impact: "+$58,672 additional opportunity"
   
3. **Waterfall Breakdown**
   - Click Money Meter to expand waterfall
   - Narrate: "Medical: $1.2M, Rx: $890K, Admin: $257K"
   - Emphasize: "Every dollar is traceable"

### Act 4: The Deep Dive (3 minutes)

**Presenter Script:**
> "Beautiful visualizations are nice, but you need details. Let's dive into the actual data..."

**Demo Flow:**
1. **Smart Filters**
   - Select "Organizations Like Yours"
   - Say: "Instant peer benchmarking"
   - Show: "You're 15% above peer average"

2. **Interactive Grid**
   - Sort by variance (high to low)
   - Expand row to show monthly trend
   - Say: "Every number tells a story"
   - Right-click → "Show calculation formula"

3. **Drill-Down**
   - Click on Q1 spike in variance
   - Say: "Unusual pharmacy rebate timing"
   - Show recommended action popup

### Act 5: The Payoff (2 minutes)

**Presenter Script:**
> "Let's get this insight into your hands right now..."

**Demo Flow:**
1. Click "Export" button
2. Select "Executive PDF Report"
3. Include: Charts, Insights, Recommendations
4. **Key Message:** "From upload to board-ready report in under 5 minutes"
5. Show PDF preview (pre-generated for speed)
6. Email to stakeholder live

**Closing Power Statement:**
> "You just witnessed 3 weeks of work completed in 5 minutes, with zero errors and immediate insights. This isn't the future—it's available today."

## The 30-Minute Deep Dive

### Extended Demo Sections

#### Minutes 16-20: Advanced Analytics
- Show cohort matching algorithm
- Demonstrate multi-year trending
- Display predictive modeling
- Run Monte Carlo simulation

#### Minutes 21-25: Configuration & Customization
- Show admin panel
- Demonstrate custom calculation rules
- Display white-label options
- Show API integration capabilities

#### Minutes 26-30: Q&A with Live Examples
- Keep system ready for ad-hoc queries
- Have backup datasets ready:
  - Small company (100 employees)
  - Large enterprise (10,000 employees)
  - Multi-state organization
  - Union vs non-union comparison

## Objection Handlers

### "How accurate is this?"
**Response:** "Our calculations match hand-validated results to the penny. Here, let me show you the audit trail..."
**Action:** Open calculation transparency panel

### "What about our unique requirements?"
**Response:** "Great question. The platform handles custom fields beautifully. Let me show you..."
**Action:** Upload `demo-custom-fields.csv` with client-specific columns

### "Is it secure?"
**Response:** "Absolutely. SOC2 Type II certified, HIPAA compliant, with row-level security..."
**Action:** Show security badges and audit log

### "What if it breaks?"
**Response:** "99.99% uptime SLA with hot failover. Let me show the status page..."
**Action:** Open status.assuredpartners.com

### "Too good to be true?"
**Response:** "I understand the skepticism. Let's upload YOUR data right now..."
**Action:** Offer live proof-of-concept

## Demo Personas & Customization

### For CFOs
- Emphasize ROI: "Saves $2.3M annually"
- Focus on accuracy: "Eliminates calculation errors"
- Highlight compliance: "Audit-ready reports"
- Show export to Excel (they love Excel)

### For Analysts
- Show formula transparency
- Demonstrate bulk operations
- Highlight keyboard shortcuts
- Display API documentation

### For Brokers
- Emphasize speed: "Win more RFPs"
- Show white-label options
- Demonstrate client portal
- Highlight competitive differentiators

### For IT Teams
- Show architecture diagram
- Demonstrate API capabilities
- Highlight security features
- Display integration options

## Technical Demo Setup

### Browser Configuration
```javascript
// Chrome DevTools Console (before demo)
localStorage.setItem('demo-mode', 'true');
localStorage.setItem('animations', 'enhanced');
localStorage.setItem('performance-badges', 'visible');
localStorage.setItem('mock-calculations', 'false'); // Use real calcs
```

### Feature Flags for Demo
```json
{
  "csvUpload": true,
  "whatIfModeling": true,
  "peerComparison": true,
  "advancedExport": true,
  "moneyMeterAnimation": true,
  "performanceBadges": true,
  "demoWatermarks": false,
  "rateLimiting": false
}
```

### Data Setup
```sql
-- Pre-demo data refresh
CALL refresh_demo_data('2025-01');
CALL generate_peer_cohorts('demo-org', 20);
CALL calculate_variances_all();
VACUUM ANALYZE;
```

## Troubleshooting Guide

### If Upload Fails
1. Say: "Let me show you with pre-processed data"
2. Navigate to: `/dashboard?org=demo-highlight`
3. Continue demo flow from Money Meter

### If Calculations Are Slow
1. Say: "Running enhanced accuracy mode..."
2. Switch to: `localStorage.setItem('turbo-mode', 'true')`
3. Mention: "Normally sub-50ms on production hardware"

### If What-If Breaks
1. Say: "Let's look at the baseline insights first"
2. Hide slider panel: Press `Ctrl+Shift+H`
3. Focus on static visualizations

### If Network Drops
1. Say: "Perfect timing to show offline capabilities"
2. Enable: `npm run demo:offline`
3. Continue with cached data

## Post-Demo Follow-Up

### Immediate Actions (Within 1 Hour)
1. Send thank you email with:
   - PDF export from demo
   - Recording link (if applicable)
   - Key metrics highlighted
   - Next steps document

2. Log in CRM:
   - Attendee reactions
   - Questions asked
   - Objections raised
   - Interest level (1-10)

### 24-Hour Follow-Up
- Schedule technical deep-dive
- Send ROI calculator
- Provide trial account access
- Book implementation planning call

### 48-Hour Follow-Up
- Send case studies
- Provide reference contacts
- Share implementation timeline
- Present pricing proposal

## Demo Metrics & Success Tracking

### Key Performance Indicators
- Time to first "wow": Target < 3 minutes
- Questions generated: Target > 5
- Engagement score: Clicks, hovers, interactions
- Follow-up rate: Target > 80%

### Demo Analytics Query
```sql
SELECT 
  demo_date,
  presenter,
  attendee_count,
  wow_moment_time,
  questions_asked,
  features_demonstrated,
  follow_up_scheduled,
  conversion_probability
FROM demo_analytics
WHERE demo_date > CURRENT_DATE - INTERVAL '30 days'
ORDER BY conversion_probability DESC;
```

## The Demo Day Checklist

### T-60 Minutes
- [ ] Test equipment (camera, mic, screen)
- [ ] Review attendee list and backgrounds
- [ ] Practice opening statement
- [ ] Load all necessary tabs
- [ ] Prepare backup materials

### T-15 Minutes
- [ ] Bio break
- [ ] Water ready
- [ ] Phone on silent
- [ ] Slack/Teams on DND
- [ ] Deep breathing exercise

### T-5 Minutes
- [ ] Join meeting early
- [ ] Test screen share
- [ ] Verify audio/video
- [ ] Smile and project confidence
- [ ] Remember: You're the expert

### Post-Demo
- [ ] Thank attendees
- [ ] Confirm next steps
- [ ] Send follow-up within 1 hour
- [ ] Debrief with team
- [ ] Update CRM

## Emergency Contacts

- **Technical Support:** demo-support@assuredpartners.com
- **Demo Emergency Line:** (555) 123-4567
- **Backup Presenter:** John Smith - (555) 234-5678
- **IT Support:** it-help@assuredpartners.com

---

**Document Owner:** Sales Engineering
**Last Updated:** January 2025
**Demo Version:** 2.0.0
**Success Rate:** 87% conversion from demo to trial