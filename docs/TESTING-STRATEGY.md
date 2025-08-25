# Testing Strategy & Quality Assurance

## Document Purpose
This document defines the comprehensive testing strategy, quality assurance processes, and testing standards for the Assured Partners Survey & Reporting Platform, ensuring reliable, performant, and maintainable code.

## Testing Philosophy

### Core Principles
1. **Test Pyramid Approach** - More unit tests, fewer E2E tests
2. **Shift Left Testing** - Test early in development cycle
3. **Performance as a Feature** - Test for <50ms response times
4. **Accessibility First** - Include A11y in all UI tests
5. **Test in Production** - Monitor real user experiences

## Testing Pyramid

```
         ╱╲
        ╱E2E╲        10% - Critical user journeys
       ╱────╲
      ╱ Integ ╲      30% - API & component integration
     ╱────────╲
    ╱   Unit    ╲    60% - Business logic & utilities
   ╱────────────╲
```

## Test Coverage Requirements

### Coverage Targets
```json
{
  "global": {
    "branches": 70,
    "functions": 70,
    "lines": 80,
    "statements": 80
  },
  "critical": {
    "calculations": 95,
    "authentication": 90,
    "dataProcessing": 85
  }
}
```

### Module-Specific Coverage

| Module | Unit | Integration | E2E | Total Target |
|--------|------|-------------|-----|--------------|
| Calculations | 95% | 85% | 70% | 90% |
| API Routes | 80% | 90% | 60% | 85% |
| UI Components | 70% | 75% | 50% | 70% |
| State Management | 85% | 80% | 60% | 80% |
| Utilities | 95% | N/A | N/A | 95% |

## Testing Layers

### 1. Unit Testing

#### Tools & Setup
```typescript
// Technologies
- Jest: Test runner
- React Testing Library: Component testing
- MSW: API mocking
- jest-dom: DOM matchers
```

#### What to Test
- Pure functions and utilities
- Component rendering
- State reducers
- Validation logic
- Calculation algorithms

#### Example: Calculation Unit Test
```typescript
// __tests__/lib/calculations/pepm.test.ts
import { calculatePEPM } from '@/lib/calculations/pepm';

describe('calculatePEPM', () => {
  it('calculates PEPM correctly with all inputs', () => {
    const result = calculatePEPM({
      totalClaims: 2500000,
      memberMonths: 12000,
      adminFees: 50000,
      stopLossRecovery: 100000,
    });

    expect(result.pepmActual).toBeCloseTo(208.33, 2);
    expect(result.breakdown.medical).toBeCloseTo(150.00, 2);
    expect(result.breakdown.rx).toBeCloseTo(45.00, 2);
  });

  it('handles zero member months gracefully', () => {
    const result = calculatePEPM({
      totalClaims: 1000000,
      memberMonths: 0,
      adminFees: 0,
      stopLossRecovery: 0,
    });

    expect(result.pepmActual).toBe(0);
    expect(result.error).toBe('Invalid member months');
  });

  it('validates negative values', () => {
    expect(() => 
      calculatePEPM({
        totalClaims: -1000,
        memberMonths: 100,
        adminFees: 0,
        stopLossRecovery: 0,
      })
    ).toThrow('Total claims cannot be negative');
  });
});
```

#### Example: Component Unit Test
```typescript
// __tests__/components/MoneyMeter.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MoneyMeter } from '@/components/data-display/MoneyMeter';

describe('MoneyMeter', () => {
  it('renders with formatted currency value', () => {
    render(<MoneyMeter value={2346892} />);
    
    expect(screen.getByText(/\$2,346,892/)).toBeInTheDocument();
    expect(screen.getByText('Total Savings Opportunity')).toBeInTheDocument();
  });

  it('shows performance badge', () => {
    render(<MoneyMeter value={1000000} />);
    
    expect(screen.getByText('42ms')).toBeInTheDocument();
  });

  it('displays trend indicator when previous value provided', () => {
    render(<MoneyMeter value={2500000} previousValue={2000000} />);
    
    expect(screen.getByText('25.0%')).toBeInTheDocument();
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
  });

  it('triggers onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<MoneyMeter value={1000000} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Integration Testing

#### Tools & Setup
```typescript
// Technologies
- Jest: Test runner
- Supertest: API testing
- Testing Library: Component integration
- PostgreSQL Test Container: Database testing
```

#### What to Test
- API endpoint flows
- Database operations
- External service integrations
- Component interactions
- State management flows

#### Example: API Integration Test
```typescript
// __tests__/api/calculations.integration.test.ts
import request from 'supertest';
import { createServer } from '@/test/server';
import { db } from '@/lib/db';

describe('POST /api/calculations/pepm', () => {
  let server: any;

  beforeAll(async () => {
    server = await createServer();
    await db.migrate();
  });

  afterAll(async () => {
    await db.close();
    server.close();
  });

  it('calculates PEPM with database persistence', async () => {
    const response = await request(server)
      .post('/api/calculations/pepm')
      .set('Authorization', 'Bearer test-token')
      .send({
        organizationId: 'test-org',
        period: '2025-01',
        data: {
          totalClaims: 2500000,
          memberMonths: 12000,
          adminFees: 50000,
          stopLossRecovery: 100000,
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.pepmActual).toBeCloseTo(208.33, 2);

    // Verify database persistence
    const saved = await db.select()
      .from(calculations)
      .where(eq(calculations.organizationId, 'test-org'));
    
    expect(saved).toHaveLength(1);
    expect(saved[0].pepmActual).toBeCloseTo(208.33, 2);
  });

  it('returns cached result on duplicate request', async () => {
    const payload = {
      organizationId: 'test-org',
      period: '2025-01',
      data: {
        totalClaims: 1000000,
        memberMonths: 5000,
      },
    };

    // First request
    const response1 = await request(server)
      .post('/api/calculations/pepm')
      .set('Authorization', 'Bearer test-token')
      .send(payload);

    // Second request (should be cached)
    const response2 = await request(server)
      .post('/api/calculations/pepm')
      .set('Authorization', 'Bearer test-token')
      .send(payload);

    expect(response2.body.meta.cached).toBe(true);
    expect(response2.body.meta.calculationTime).toBeLessThan(10);
  });
});
```

#### Example: Component Integration Test
```typescript
// __tests__/integration/WhatIfPanel.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WhatIfPanel } from '@/components/panels/WhatIfPanel';
import { server } from '@/test/mocks/server';

describe('WhatIfPanel Integration', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('updates calculations when sliders change', async () => {
    render(<WhatIfPanel baseValue={2000000} />, { wrapper });

    const employeeSlider = screen.getByLabelText('Employee Count Adjustment');
    
    fireEvent.change(employeeSlider, { target: { value: '2.5' } });

    await waitFor(() => {
      expect(screen.getByText(/Adjusted: 2.5%/)).toBeInTheDocument();
      expect(screen.getByText(/Impact: \$50,000/)).toBeInTheDocument();
    });

    // Verify performance badge
    expect(screen.getByText(/\d+ms/)).toBeInTheDocument();
  });

  it('resets adjustments when reset button clicked', async () => {
    render(<WhatIfPanel baseValue={1000000} />, { wrapper });

    const slider = screen.getByLabelText('Rebate Timing Adjustment');
    fireEvent.change(slider, { target: { value: '1' } });

    await waitFor(() => {
      expect(screen.getByText(/Adjusted: 1 month/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Reset'));

    await waitFor(() => {
      expect(screen.queryByText(/Adjusted:/)).not.toBeInTheDocument();
    });
  });
});
```

### 3. End-to-End Testing

#### Tools & Setup
```typescript
// Technologies
- Playwright: Modern E2E testing
- Lighthouse CI: Performance testing
- Axe Playwright: Accessibility testing
```

#### What to Test
- Critical user journeys
- Cross-browser compatibility
- Performance benchmarks
- Accessibility compliance
- Visual regression

#### Example: E2E Test
```typescript
// e2e/specs/demo-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Demo Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Start Demo');
  });

  test('completes 6-step demo journey', async ({ page }) => {
    // Step 1: Filter
    await expect(page.locator('.filter-bar')).toHaveClass(/highlighted/);
    await page.selectOption('select[name="organization"]', 'Acme Corp');
    await page.click('text=Next');

    // Step 2: Money Meter
    await expect(page.locator('.money-meter')).toHaveClass(/highlighted/);
    await expect(page.locator('.money-meter')).toContainText('$2,346,892');
    await page.click('text=Next');

    // Step 3: What-If Sliders
    await expect(page.locator('.what-if-panel')).toHaveClass(/highlighted/);
    await page.fill('input[name="employeeCount"]', '2.5');
    await expect(page.locator('.impact-display')).toContainText('$58,672');
    await page.click('text=Next');

    // Step 4: Waterfall Chart
    await expect(page.locator('.variance-chart')).toHaveClass(/highlighted/);
    await expect(page.locator('.waterfall-bar')).toHaveCount(4);
    await page.click('text=Next');

    // Step 5: Reporting Grid
    await expect(page.locator('.reporting-grid')).toHaveClass(/highlighted/);
    await page.click('tr:first-child .expand-button');
    await expect(page.locator('.expanded-row')).toBeVisible();
    await page.click('text=Next');

    // Step 6: Export
    await expect(page.locator('.export-button')).toHaveClass(/highlighted/);
    await page.click('text=Finish Demo');

    // Verify completion
    await expect(page.locator('.demo-complete-modal')).toBeVisible();
  });

  test('meets performance targets', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Measure calculation performance
    const performanceBadge = page.locator('.performance-badge');
    const time = await performanceBadge.textContent();
    const ms = parseInt(time?.replace('ms', '') || '0');

    expect(ms).toBeLessThan(50);
  });

  test('passes accessibility audit', async ({ page }) => {
    await page.goto('/dashboard');
    
    const accessibilityScanResults = await page.evaluate(() => {
      return new Promise((resolve) => {
        // @ts-ignore
        window.axe.run((err, results) => {
          resolve(results.violations);
        });
      });
    });

    expect(accessibilityScanResults).toEqual([]);
  });
});
```

## Performance Testing

### Performance Benchmarks
```typescript
// __tests__/performance/calculations.perf.test.ts
import { performance } from 'perf_hooks';
import { calculatePEPM } from '@/lib/calculations/pepm';

describe('Performance: Calculations', () => {
  it('calculates PEPM in under 50ms', () => {
    const dataset = generateLargeDataset(1000);
    
    const start = performance.now();
    calculatePEPM(dataset);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(50);
  });

  it('handles 10,000 rows in under 500ms', () => {
    const dataset = generateLargeDataset(10000);
    
    const start = performance.now();
    processDataset(dataset);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(500);
  });
});
```

### Load Testing
```typescript
// load-tests/api-stress.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,        // 100 virtual users
  duration: '30s', // 30 second test
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
  },
};

export default function () {
  const payload = JSON.stringify({
    organizationId: 'test-org',
    period: '2025-01',
    data: {
      totalClaims: Math.random() * 5000000,
      memberMonths: Math.random() * 20000,
    },
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token',
    },
  };

  const res = http.post('http://localhost:3000/api/calculations/pepm', payload, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 50ms': (r) => r.timings.duration < 50,
    'has pepm value': (r) => JSON.parse(r.body).data.pepmActual > 0,
  });
  
  sleep(1);
}
```

## Accessibility Testing

### Automated A11y Tests
```typescript
// __tests__/accessibility/components.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility: Components', () => {
  it('MoneyMeter has no accessibility violations', async () => {
    const { container } = render(<MoneyMeter value={1000000} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ReportingGrid meets WCAG standards', async () => {
    const { container } = render(
      <ReportingGrid 
        columns={mockColumns}
        data={mockData}
      />
    );
    
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
        'valid-aria-roles': { enabled: true },
        'button-name': { enabled: true },
      },
    });
    
    expect(results).toHaveNoViolations();
  });
});
```

## Visual Regression Testing

### Setup
```typescript
// playwright.config.ts
export default {
  use: {
    // Visual regression config
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
  },
  projects: [
    {
      name: 'visual-regression',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
};
```

### Visual Tests
```typescript
// e2e/visual/dashboard.visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression: Dashboard', () => {
  test('dashboard layout matches baseline', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('dashboard-full.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('money meter animation completes correctly', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for animation
    await page.waitForTimeout(3500);
    
    await expect(page.locator('.money-meter')).toHaveScreenshot('money-meter-final.png');
  });
});
```

## Test Data Management

### Test Data Factory
```typescript
// test/factories/organization.factory.ts
import { faker } from '@faker-js/faker';

export const organizationFactory = {
  build: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    size: faker.helpers.arrayElement(['small', 'medium', 'large']),
    funding: faker.helpers.arrayElement(['self-funded', 'fully-insured']),
    carrier: faker.helpers.arrayElement(['BCBS', 'Aetna', 'UHC']),
    memberCount: faker.number.int({ min: 100, max: 10000 }),
    ...overrides,
  }),

  buildList: (count: number, overrides = {}) => {
    return Array.from({ length: count }, () => 
      organizationFactory.build(overrides)
    );
  },
};
```

### Database Seeding
```typescript
// test/seeds/test-data.ts
export async function seedTestData() {
  await db.transaction(async (tx) => {
    // Clear existing data
    await tx.delete(calculations);
    await tx.delete(organizations);
    
    // Insert test organizations
    const orgs = organizationFactory.buildList(10);
    await tx.insert(organizations).values(orgs);
    
    // Insert test calculations
    for (const org of orgs) {
      const calcs = calculationFactory.buildList(12, {
        organizationId: org.id,
      });
      await tx.insert(calculations).values(calcs);
    }
  });
}
```

## Continuous Integration Testing

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:unit
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - run: npm ci
      - run: npm run db:migrate
      - run: npm run test:integration
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - run: npm ci
      - run: npm run build
      - run: npm run test:performance
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/dashboard
          uploadArtifacts: true
          temporaryPublicStorage: true
```

## Test Scripts

### package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern='.unit.test.'",
    "test:integration": "jest --testPathPattern='.integration.test.'",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:performance": "jest --testPathPattern='.perf.test.'",
    "test:a11y": "jest --testPathPattern='.a11y.test.'",
    "test:visual": "playwright test --project=visual-regression",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "npm run test:unit && npm run test:integration",
    "test:load": "k6 run load-tests/api-stress.js"
  }
}
```

## Quality Gates

### Pre-Commit Hooks
```json
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run format:check
npm run lint
npm run type-check
npm run test:unit
```

### Pull Request Checks
- [ ] All tests passing
- [ ] Code coverage maintained/improved
- [ ] No performance regressions
- [ ] Accessibility audit passed
- [ ] Visual regression approved
- [ ] Security scan clean

## Test Documentation

### Test Plan Template
```markdown
## Feature: [Feature Name]

### Test Objectives
- Verify [objective 1]
- Validate [objective 2]
- Ensure [objective 3]

### Test Scenarios
1. **Happy Path**
   - Given: [initial state]
   - When: [action]
   - Then: [expected result]

2. **Edge Case**
   - Given: [edge condition]
   - When: [action]
   - Then: [graceful handling]

3. **Error Case**
   - Given: [error condition]
   - When: [action]
   - Then: [error recovery]

### Test Data Requirements
- [Data requirement 1]
- [Data requirement 2]

### Success Criteria
- [ ] All scenarios pass
- [ ] Performance under 50ms
- [ ] Accessibility compliant
- [ ] Cross-browser verified
```

---

**Document Owner:** QA Lead
**Last Updated:** January 2025
**Testing Framework Version:** 1.0.0