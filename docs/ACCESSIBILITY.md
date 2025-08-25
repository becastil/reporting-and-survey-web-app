# Accessibility Guidelines & Standards

## Commitment Statement

The Assured Partners Survey & Reporting Platform is committed to providing an accessible experience for all users, including those with disabilities. We follow WCAG 2.1 Level AA standards and continuously test our platform for accessibility compliance.

## Standards & Compliance

### Target Compliance
- **Standard:** WCAG 2.1 Level AA
- **Testing Tools:** 
  - axe DevTools
  - WAVE (WebAIM)
  - NVDA/JAWS screen readers
  - Keyboard-only navigation testing

### Key Requirements

#### Visual Requirements
- **Color Contrast Ratios:**
  - Normal text: 4.5:1 minimum
  - Large text (18pt+): 3:1 minimum
  - Interactive elements: 3:1 minimum
  - Verified brand colors:
    - Brand Blue (#003D7A) on white: 11.98:1 ✅
    - Success Green (#00A86B) on white: 3.17:1 ✅
    - Error Red (#EF4444) on white: 3.23:1 ✅

- **Focus Indicators:**
  - All interactive elements have visible focus states
  - Focus ring uses brand blue with 3px width
  - Never rely on color alone to convey information

- **Text Sizing:**
  - Base font size: 16px minimum
  - Scalable up to 200% without horizontal scrolling
  - Relative units (rem/em) for all text

#### Interaction Requirements
- **Keyboard Navigation:**
  - All functionality available via keyboard
  - Logical tab order (left-to-right, top-to-bottom)
  - Skip links for main content
  - Escape key closes modals/dropdowns
  - Arrow keys navigate menus and data grids

- **Screen Reader Support:**
  - Semantic HTML5 elements
  - ARIA labels for interactive elements
  - Live regions for dynamic updates
  - Descriptive link text (no "click here")
  - Alt text for all informative images

- **Touch Targets:**
  - Minimum 44x44px for mobile
  - Adequate spacing between targets
  - Gesture alternatives for complex interactions

#### Content Requirements
- **Alternative Text:**
  - Descriptive alt text for charts/graphs
  - Empty alt="" for decorative images
  - Complex visualizations have text descriptions

- **Heading Structure:**
  - Single H1 per page
  - Logical heading hierarchy (no skipping levels)
  - Headings describe content sections

- **Form Labels:**
  - All inputs have associated labels
  - Required fields clearly marked
  - Error messages associated with fields
  - Instructions before form fields

## Component-Specific Guidelines

### Dashboard Components

#### Money Meter
```tsx
// Accessibility implementation
<div 
  role="status" 
  aria-live="polite"
  aria-label={`Savings opportunity: ${formattedValue}`}
>
  <span className="sr-only">
    Savings opportunity updated to {formattedValue}
  </span>
  {/* Visual counter */}
</div>
```

#### Reporting Grid
- Use semantic `<table>` elements
- Include `<caption>` for table description
- Sortable columns announced to screen readers
- Row expansion state communicated via ARIA

#### What-If Sliders
```tsx
<input
  type="range"
  role="slider"
  aria-label="Employee count adjustment"
  aria-valuemin={-5}
  aria-valuemax={5}
  aria-valuenow={value}
  aria-valuetext={`${value}% adjustment`}
/>
```

#### Filter Bar
- Combobox pattern for dropdowns
- Multi-select states announced
- Active filters listed in live region

### Navigation Patterns

#### Tab Navigation Order
1. Skip to main content link
2. Main navigation
3. Filter bar
4. Money Meter
5. Primary content (grid)
6. Secondary content (panels)
7. Footer

#### Modal Dialogs
- Focus trapped within modal
- Focus returns to trigger on close
- Escape key closes
- Background content aria-hidden

## Testing Checklist

### Manual Testing
- [ ] Navigate entire app using only keyboard
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Verify all color contrasts
- [ ] Check focus indicators visibility
- [ ] Test at 200% zoom level
- [ ] Verify touch targets on mobile
- [ ] Test with browser extensions disabled

### Automated Testing
```bash
# Run accessibility tests
npm run test:a11y

# Check specific component
npm run test:a11y -- MoneyMeter

# Generate accessibility report
npm run a11y:report
```

### Component Checklist
For each new component:
- [ ] Semantic HTML used
- [ ] Keyboard navigation works
- [ ] ARIA attributes added where needed
- [ ] Focus management correct
- [ ] Color contrast passes
- [ ] Screen reader tested
- [ ] Error states accessible
- [ ] Loading states announced

## Implementation Examples

### Accessible Button
```tsx
<Button
  aria-label="Calculate savings"
  aria-pressed={isCalculating}
  disabled={isDisabled}
>
  {isCalculating ? (
    <>
      <Spinner aria-hidden="true" />
      <span className="sr-only">Calculating...</span>
      <span aria-hidden="true">Calculate</span>
    </>
  ) : (
    'Calculate'
  )}
</Button>
```

### Accessible Form Field
```tsx
<div>
  <Label htmlFor="org-name">
    Organization Name
    <span aria-label="required">*</span>
  </Label>
  <Input
    id="org-name"
    aria-required="true"
    aria-invalid={!!errors.orgName}
    aria-describedby={errors.orgName ? "org-name-error" : undefined}
  />
  {errors.orgName && (
    <p id="org-name-error" role="alert" className="text-status-error">
      {errors.orgName}
    </p>
  )}
</div>
```

### Accessible Data Visualization
```tsx
<figure>
  <figcaption id="variance-chart-caption">
    Monthly variance trend showing $2.3M opportunity
  </figcaption>
  <div 
    role="img" 
    aria-labelledby="variance-chart-caption"
    aria-describedby="variance-chart-description"
  >
    {/* Plotly chart */}
  </div>
  <p id="variance-chart-description" className="sr-only">
    Detailed description: The chart shows variance trending upward 
    from $1.8M in January to $2.3M in December, with the largest 
    increase occurring in Q3.
  </p>
</figure>
```

## Motion & Animation Accessibility

### Respecting User Preferences
```css
/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### JavaScript Implementation
```tsx
// Check user preference
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Apply conditionally
const animationDuration = prefersReducedMotion ? 0 : 300;
```

## Resources & Tools

### Development Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Contrast Ratio Checker](https://webaim.org/resources/contrastchecker/)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Testing Services
- [Accessibility Insights](https://accessibilityinsights.io/)
- [Pa11y Command Line Tool](https://pa11y.org/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

## Reporting Issues

If you discover an accessibility issue:

1. Check if it's already reported in [GitHub Issues](https://github.com/assured-partners/survey-platform/issues?q=label:accessibility)
2. If not, create a new issue with:
   - Description of the barrier
   - Steps to reproduce
   - Assistive technology used
   - Expected behavior
   - Screenshots if applicable
3. Label the issue with `accessibility`

## Contact

For accessibility questions or concerns:
- Email: accessibility@assuredpartners.com
- Slack: #platform-accessibility

---

**Last Updated:** January 2025
**Next Review:** April 2025
**Owner:** Platform Team