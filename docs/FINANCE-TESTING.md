# Finance-Specific Testing & Data Integrity

## Document Purpose
This document defines finance-specific testing requirements, data integrity invariants, and domain-specific quality gates for the Assured Partners platform's financial calculations and survey processing.

## 1. Financial Invariants Testing

### Core Mathematical Invariants
These equations MUST hold true for every calculation, every month, every organization:

```typescript
// invariants/finance.test.ts
describe('Financial Invariants', () => {
  const TOLERANCE = 0.01; // 1 cent tolerance for floating point

  it('enforces monthly claims equation', () => {
    const result = calculateMonthlyMetrics(testData);
    
    const expected = 
      result.totalAdjustedMedical +
      result.pharmacyClaims +
      result.adminFees +
      result.consultingFees +
      result.stopLossFees +
      result.rxRebates -        // Note: negative value
      result.stopLossReimb;     // Note: negative value
    
    expect(result.monthlyClaimsExpenses).toBeCloseTo(expected, 2);
  });

  it('enforces PEPM calculation', () => {
    const result = calculatePEPM(testData);
    
    expect(result.pepmActual).toBeCloseTo(
      result.monthlyClaimsExpenses / result.employeeCount, 
      2
    );
    
    // Guard against division by zero
    expect(result.employeeCount).toBeGreaterThan(0);
  });

  it('enforces cumulative actual calculation', () => {
    const months = ['2025-01', '2025-02', '2025-03'];
    const results = months.map(m => calculateMonthlyMetrics(data[m]));
    
    const cumulative = results.reduce((sum, r) => 
      sum + r.monthlyClaimsExpenses, 0
    );
    
    expect(results[2].cumulativeActual).toBeCloseTo(cumulative, 2);
  });

  it('enforces variance calculations', () => {
    const result = calculateVariance(testData);
    
    const expectedAmount = 
      result.monthlyClaimsExpenses - result.budgetAtEmployeeCounts;
    
    const expectedPercent = 
      (expectedAmount / result.budgetAtEmployeeCounts) * 100;
    
    expect(result.varianceAmount).toBeCloseTo(expectedAmount, 2);
    expect(result.variancePercent).toBeCloseTo(expectedPercent, 2);
  });

  it('enforces sign conventions', () => {
    const result = processLineItems(testData);
    
    // Rebates are credits (negative)
    expect(result.rxRebates).toBeLessThanOrEqual(0);
    
    // Stop loss reimbursements are credits (negative)
    expect(result.stopLossReimb).toBeLessThanOrEqual(0);
    
    // All fees are positive
    expect(result.adminFees).toBeGreaterThanOrEqual(0);
    expect(result.consultingFees).toBeGreaterThanOrEqual(0);
    expect(result.stopLossFees).toBeGreaterThanOrEqual(0);
    
    // Counts must be positive
    expect(result.employeeCount).toBeGreaterThan(0);
    expect(result.memberCount).toBeGreaterThanOrEqual(result.employeeCount);
  });
});
```

### Database Constraints
```sql
-- migrations/add_financial_constraints.sql
ALTER TABLE monthly_metrics
  ADD CONSTRAINT chk_positive_ee_count 
    CHECK (employee_count > 0),
  
  ADD CONSTRAINT chk_member_ge_employee 
    CHECK (member_count >= employee_count),
  
  ADD CONSTRAINT chk_rebate_sign 
    CHECK (COALESCE((line_items->>'rxRebates')::numeric, 0) <= 0),
  
  ADD CONSTRAINT chk_stoploss_reimb_sign 
    CHECK (COALESCE((line_items->>'stopLossReimb')::numeric, 0) <= 0),
  
  ADD CONSTRAINT chk_positive_fees 
    CHECK (
      COALESCE((line_items->>'adminFees')::numeric, 0) >= 0 AND
      COALESCE((line_items->>'consultingFees')::numeric, 0) >= 0 AND
      COALESCE((line_items->>'stopLossFees')::numeric, 0) >= 0
    ),
  
  ADD CONSTRAINT chk_pepm_calculation 
    CHECK (
      ABS(pepm_actual - (monthly_claims_expenses / NULLIF(employee_count, 0))) < 0.01
      OR employee_count = 0
    );
```

## 2. Golden Dataset Testing

### Golden Dataset Structure
```typescript
// test-data/golden-dataset.ts
export const GOLDEN_DATASET = {
  metadata: {
    organizations: 40,
    monthsPerOrg: 12,
    totalRows: 480,
    generatedDate: '2025-01-25',
    version: '1.0.0',
  },
  
  expectedTotals: {
    totalClaimsExpenses: 125_346_892.45,
    totalEmployees: 65_432,
    totalMembers: 142_876,
    averagePEPM: 208.33,
    totalVariance: 2_346_892.00,
  },
  
  data: [
    {
      orgId: 'org-001',
      orgName: 'Acme Corporation',
      month: '2025-01',
      employeeCount: 1_245,
      memberCount: 2_890,
      lineItems: {
        totalAdjustedMedical: 186_750.00,
        pharmacyClaims: 55_890.00,
        adminFees: 5_189.00,
        consultingFees: 1_200.00,
        stopLossFees: 890.00,
        rxRebates: -12_450.00,
        stopLossReimb: -8_900.00,
      },
      expected: {
        monthlyClaimsExpenses: 228_569.00,
        pepmActual: 183.63,
        varianceAmount: 12_569.00,
        variancePercent: 5.82,
      },
    },
    // ... 479 more rows
  ],
};
```

### Golden Dataset Tests
```typescript
// __tests__/golden-dataset.test.ts
import { GOLDEN_DATASET } from '@/test-data/golden-dataset';

describe('Golden Dataset Validation', () => {
  it('validates all 480 rows match expected calculations', () => {
    let totalClaims = 0;
    let totalEmployees = 0;
    let totalVariance = 0;
    
    GOLDEN_DATASET.data.forEach((row, index) => {
      const result = calculateMonthlyMetrics(row);
      
      // Validate individual row
      expect(result.monthlyClaimsExpenses).toBeCloseTo(
        row.expected.monthlyClaimsExpenses, 2,
        `Row ${index}: Monthly claims mismatch`
      );
      
      expect(result.pepmActual).toBeCloseTo(
        row.expected.pepmActual, 2,
        `Row ${index}: PEPM mismatch`
      );
      
      // Accumulate totals
      totalClaims += result.monthlyClaimsExpenses;
      totalEmployees += row.employeeCount;
      totalVariance += result.varianceAmount;
    });
    
    // Validate totals
    expect(totalClaims).toBeCloseTo(
      GOLDEN_DATASET.expectedTotals.totalClaimsExpenses, 2
    );
    expect(totalEmployees).toBe(
      GOLDEN_DATASET.expectedTotals.totalEmployees
    );
    expect(totalVariance).toBeCloseTo(
      GOLDEN_DATASET.expectedTotals.totalVariance, 2
    );
  });

  it('validates waterfall components equal grid totals', () => {
    const gridTotal = GOLDEN_DATASET.data.reduce((sum, row) => 
      sum + row.expected.varianceAmount, 0
    );
    
    const waterfallComponents = calculateWaterfallBreakdown(GOLDEN_DATASET.data);
    const waterfallTotal = Object.values(waterfallComponents)
      .reduce((sum, val) => sum + val, 0);
    
    expect(waterfallTotal).toBeCloseTo(gridTotal, 2);
  });
});
```

## 3. Survey Ingest Robustness

### Encoding Detection & Header Mapping
```typescript
// __tests__/survey-ingest.test.ts
import iconv from 'iconv-lite';
import fc from 'fast-check';

describe('Survey Ingest Robustness', () => {
  it('detects and handles multiple encodings', async () => {
    const encodings = ['utf-8', 'utf-8-sig', 'cp1252', 'latin1', 'iso-8859-1'];
    
    for (const encoding of encodings) {
      const buffer = iconv.encode(SAMPLE_CSV, encoding);
      const result = await processCSVUpload(buffer);
      
      expect(result.detectedEncoding).toBe(encoding);
      expect(result.rows).toHaveLength(100);
      expect(result.errors).toHaveLength(0);
    }
  });

  it('handles ragged rows gracefully', async () => {
    const raggedCSV = `
      Col1,Col2,Col3
      A,B,C
      D,E  // Missing column
      F,G,H,I  // Extra column
      J,K,L
    `;
    
    const result = await processCSVUpload(raggedCSV);
    
    expect(result.warnings).toContainEqual({
      row: 3,
      type: 'MISSING_COLUMN',
      message: 'Row 3 has 2 columns, expected 3',
    });
    
    expect(result.warnings).toContainEqual({
      row: 4,
      type: 'EXTRA_COLUMN',
      message: 'Row 4 has 4 columns, expected 3',
    });
  });

  // Property-based testing for header variations
  it('maps any "Medical Plan N" header pattern', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 12 }),
        fc.constantFrom(
          'Plan Type',
          'Monthly Premium',
          'Enrollment Count',
          'Employer Contribution',
          'Employee Contribution'
        ),
        (planNumber, field) => {
          const header = `Medical Plan ${planNumber} - ${field}`;
          const mapping = mapHeaderToQuestion(header);
          
          expect(mapping.repeatIndex).toBe(planNumber);
          expect(mapping.questionCode).toMatch(/^medical_plan\./);
          expect(mapping.field).toBe(field.toLowerCase().replace(/ /g, '_'));
        }
      )
    );
  });

  it('provides actionable error messages', async () => {
    const invalidCSV = `
      Organization,PEPM,Invalid€Symbol
      Acme Corp,208.33,Test
      Beta Inc,not-a-number,Test
    `;
    
    const result = await processCSVUpload(invalidCSV);
    
    expect(result.errors).toContainEqual({
      row: 1,
      column: 3,
      header: 'Invalid€Symbol',
      type: 'INVALID_CHARACTER',
      message: "Column 'Invalid€Symbol' contains invalid character '€'",
      suggestion: 'Remove special characters from column headers',
    });
    
    expect(result.errors).toContainEqual({
      row: 3,
      column: 2,
      value: 'not-a-number',
      type: 'INVALID_NUMBER',
      message: "Expected number in 'PEPM' column, got 'not-a-number'",
      suggestion: 'Ensure all PEPM values are numeric',
    });
  });
});
```

### Mapping Registry Tests
```typescript
// __tests__/mapping-registry.test.ts
describe('Survey Mapping Registry', () => {
  const REGISTRY = {
    patterns: [
      {
        regex: /^Medical Plan (\d+) - (.+)$/,
        handler: 'repeatableMedicalPlan',
        extractIndex: 1,
        extractField: 2,
      },
      {
        regex: /^Dental Plan (\d+) - (.+)$/,
        handler: 'repeatableDentalPlan',
        extractIndex: 1,
        extractField: 2,
      },
    ],
    
    fieldMappings: {
      'Plan Type': 'plan_type',
      'Monthly Premium': 'monthly_premium',
      'Enrollment Count': 'enrollment_count',
      'Employer Contribution': 'employer_contribution',
      'Employee Contribution': 'employee_contribution',
    },
  };

  it('correctly maps 1,200 column survey to normalized structure', () => {
    const headers = generateMassiveSurveyHeaders(); // 1,200 columns
    const mappings = headers.map(h => mapHeader(h, REGISTRY));
    
    // Verify no unmapped columns
    const unmapped = mappings.filter(m => !m.mapped);
    expect(unmapped).toHaveLength(0);
    
    // Verify repeatable groups detected
    const medicalPlans = mappings.filter(m => 
      m.handler === 'repeatableMedicalPlan'
    );
    expect(medicalPlans.length).toBeGreaterThan(0);
    
    // Verify unique database columns generated
    const dbColumns = new Set(mappings.map(m => m.dbColumn));
    expect(dbColumns.size).toBeLessThan(200); // Normalized from 1,200
  });
});
```

## 4. What-If Immutability & Correctness

### Immutability Tests
```typescript
// __tests__/what-if-immutability.test.ts
import { cloneDeep } from 'lodash';

describe('What-If Immutability', () => {
  it('never mutates baseline data', () => {
    const baseline = loadBaselineMetrics();
    const frozen = Object.freeze(cloneDeep(baseline));
    
    // Apply what-if adjustments
    const adjusted = applyWhatIf(frozen, {
      rebateTimingMonths: 2,
      employeeCountPercent: 5,
    });
    
    // Verify baseline unchanged
    expect(frozen).toEqual(baseline);
    expect(adjusted).not.toEqual(baseline);
  });

  it('adjustments are perfectly reversible', () => {
    const baseline = loadBaselineMetrics();
    
    // Apply adjustment
    const forward = applyWhatIf(baseline, { rebateTimingMonths: 2 });
    
    // Reverse adjustment
    const reversed = applyWhatIf(forward, { rebateTimingMonths: -2 });
    
    // Should match baseline exactly
    expect(reversed).toEqual(baseline);
  });

  it('handles concurrent slider moves correctly', async () => {
    const baseline = loadBaselineMetrics();
    let latestResult = baseline;
    
    // Simulate rapid slider moves
    const moves = [1, 2, 3, 2, 1, 0, -1, -2];
    const promises = moves.map((value, index) => 
      setTimeout(() => {
        latestResult = applyWhatIf(baseline, { 
          rebateTimingMonths: value 
        });
      }, index * 10)
    );
    
    await Promise.all(promises);
    
    // Only last move should be applied
    expect(latestResult.adjustments.rebateTimingMonths).toBe(-2);
  });

  it('rebate timing shift preserves total', () => {
    const baseline = loadQuarterlyData();
    const totalRebates = sumRebates(baseline);
    
    for (let shift = -3; shift <= 3; shift++) {
      const adjusted = applyRebateTiming(baseline, shift);
      const adjustedTotal = sumRebates(adjusted);
      
      expect(adjustedTotal).toBeCloseTo(totalRebates, 2);
    }
  });
});
```

## 5. Multi-Tenancy & Row-Level Security

### RLS Tests
```typescript
// __tests__/row-level-security.test.ts
describe('Row-Level Security', () => {
  it('prevents cross-organization data access', async () => {
    const userA = await createTestUser({ orgId: 'org-a' });
    const userB = await createTestUser({ orgId: 'org-b' });
    
    // User A tries to access User B's data
    const response = await apiClient
      .withAuth(userA.token)
      .get('/api/metrics/org-b');
    
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Access denied');
  });

  it('cohort matching respects org boundaries', async () => {
    const user = await createTestUser({ orgId: 'org-test' });
    
    const cohorts = await apiClient
      .withAuth(user.token)
      .get('/api/cohorts/similar');
    
    // Verify no data leakage
    cohorts.body.data.forEach(org => {
      expect(org.details).toBeUndefined(); // No sensitive data
      expect(org.id).not.toBe('org-test'); // Not self
      expect(org.memberCount).toBeUndefined(); // No counts
    });
  });

  it('filters cascade through all queries', async () => {
    const user = await createTestUser({ 
      orgId: 'org-multi',
      permissions: ['org-1', 'org-2', 'org-3']
    });
    
    const metrics = await apiClient
      .withAuth(user.token)
      .get('/api/metrics');
    
    const orgIds = metrics.body.data.map(m => m.organizationId);
    const uniqueOrgs = new Set(orgIds);
    
    expect(uniqueOrgs).toEqual(new Set(['org-1', 'org-2', 'org-3']));
  });
});
```

## 6. Performance Testing with Realistic Conditions

### CPU-Throttled Tests
```typescript
// __tests__/performance-realistic.test.ts
import { cpuThrottle } from '@/test/utils/throttle';

describe('Performance under realistic conditions', () => {
  beforeAll(() => {
    cpuThrottle(6); // 6x slowdown to simulate average hardware
  });

  it('meets p95 targets under throttling', async () => {
    const times: number[] = [];
    
    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      await calculatePEPM(generateRandomData());
      times.push(performance.now() - start);
    }
    
    times.sort((a, b) => a - b);
    const p95 = times[Math.floor(times.length * 0.95)];
    const p99 = times[Math.floor(times.length * 0.99)];
    
    expect(p95).toBeLessThan(120); // Throttled target
    expect(p99).toBeLessThan(200); // Throttled target
  });

  it('handles scale without N+1 queries', async () => {
    // 100 orgs × 36 months × 5 plans = 18,000 records
    const dataset = generateLargeDataset(100, 36, 5);
    
    const queryCount = trackDatabaseQueries(() => {
      const result = calculateAggregateMetrics(dataset);
    });
    
    // Should use batch queries, not N+1
    expect(queryCount).toBeLessThan(10);
  });
});
```

### K6 Load Test with Percentiles
```javascript
// load-tests/api-stress-realistic.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up
    { duration: '2m', target: 100 },  // Sustain
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],       // 99% success
    http_req_duration: [
      'p(50)<100',   // Median under 100ms
      'p(95)<300',   // P95 under 300ms
      'p(99)<600',   // P99 under 600ms
    ],
  },
};

export default function() {
  const payload = generateRealisticPayload();
  
  const res = http.post(
    'http://localhost:3000/api/calculations/pepm',
    JSON.stringify(payload),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has calculation time': (r) => {
      const body = JSON.parse(r.body);
      return body.meta?.calculationTime !== undefined;
    },
    'calculation < 50ms': (r) => {
      const body = JSON.parse(r.body);
      return body.meta?.calculationTime < 50;
    },
  });
}
```

## 7. Visual Regression for Critical States

### CSV Upload States
```typescript
// e2e/visual/csv-upload.visual.spec.ts
test.describe('CSV Upload Visual States', () => {
  test('drag-and-drop states', async ({ page }) => {
    await page.goto('/survey/upload');
    
    // Initial state
    await expect(page.locator('.upload-zone')).toHaveScreenshot(
      'csv-upload-initial.png'
    );
    
    // Drag over state
    await page.locator('.upload-zone').dispatchEvent('dragenter');
    await expect(page.locator('.upload-zone')).toHaveScreenshot(
      'csv-upload-dragover.png'
    );
    
    // Processing state
    await page.setInputFiles('input[type="file"]', 'test-files/sample.csv');
    await expect(page.locator('.upload-zone')).toHaveScreenshot(
      'csv-upload-processing.png'
    );
    
    // Error state with row highlighting
    await page.setInputFiles('input[type="file"]', 'test-files/invalid.csv');
    await page.waitForSelector('.error-rows');
    await expect(page.locator('.validation-results')).toHaveScreenshot(
      'csv-upload-errors.png'
    );
    
    // Success state
    await page.setInputFiles('input[type="file"]', 'test-files/valid.csv');
    await page.waitForSelector('.success-message');
    await expect(page.locator('.upload-zone')).toHaveScreenshot(
      'csv-upload-success.png'
    );
  });

  test('reduced motion mode', async ({ page }) => {
    // Enable reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/dashboard');
    
    // Verify no animations
    const hasTransitions = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      return Array.from(elements).some(el => {
        const style = getComputedStyle(el);
        return style.transitionDuration !== '0s' || 
               style.animationDuration !== '0s';
      });
    });
    
    expect(hasTransitions).toBe(false);
    
    await expect(page).toHaveScreenshot('reduced-motion-dashboard.png');
  });
});
```

## 8. Export Determinism

### PDF Export Tests
```typescript
// __tests__/pdf-export.test.ts
describe('PDF Export Determinism', () => {
  it('produces identical PDFs for same data', async () => {
    const data = GOLDEN_DATASET.data.slice(0, 12);
    
    const pdf1 = await generatePDF(data, { locale: 'en-US' });
    const pdf2 = await generatePDF(data, { locale: 'en-US' });
    
    // Compare excluding metadata (timestamps)
    const content1 = extractPDFContent(pdf1);
    const content2 = extractPDFContent(pdf2);
    
    expect(content1).toEqual(content2);
  });

  it('totals match between screen and export', async () => {
    const screenData = await fetchDashboardData({ org: 'test' });
    const pdfData = await generatePDF(screenData);
    
    const screenTotals = calculateTotals(screenData);
    const pdfTotals = extractPDFTotals(pdfData);
    
    expect(pdfTotals.totalClaims).toEqual(screenTotals.totalClaims);
    expect(pdfTotals.totalVariance).toEqual(screenTotals.totalVariance);
    expect(pdfTotals.averagePEPM).toEqual(screenTotals.averagePEPM);
  });

  it('handles page breaks correctly', async () => {
    const largeDataset = GOLDEN_DATASET.data; // 480 rows
    const pdf = await generatePDF(largeDataset);
    
    const pages = extractPages(pdf);
    
    // Each page should have complete rows
    pages.forEach(page => {
      expect(page.rows.every(r => r.isComplete)).toBe(true);
    });
    
    // Totals should appear on last page
    expect(pages[pages.length - 1].hasTotals).toBe(true);
  });
});
```

## 9. Cache Coherency

### Cache Invalidation Tests
```typescript
// __tests__/cache-coherency.test.ts
describe('Cache Coherency', () => {
  it('invalidates cohort stats after new upload', async () => {
    // Get initial cohort stats
    const initial = await apiClient.get('/api/cohorts/stats');
    expect(initial.headers['x-cache']).toBe('HIT');
    
    // Upload new data
    await apiClient.post('/api/upload', { 
      file: 'new-data.csv' 
    });
    
    // Cohort stats should be recalculated
    const updated = await apiClient.get('/api/cohorts/stats');
    expect(updated.headers['x-cache']).toBe('MISS');
    expect(updated.body).not.toEqual(initial.body);
  });

  it('maintains cache consistency across calculations', async () => {
    const org = 'test-org';
    
    // Prime cache
    await apiClient.get(`/api/calculations/${org}`);
    
    // Concurrent requests should get same cached result
    const results = await Promise.all([
      apiClient.get(`/api/calculations/${org}`),
      apiClient.get(`/api/calculations/${org}`),
      apiClient.get(`/api/calculations/${org}`),
    ]);
    
    expect(results[0].body).toEqual(results[1].body);
    expect(results[1].body).toEqual(results[2].body);
    
    results.forEach(r => {
      expect(r.headers['x-cache']).toBe('HIT');
    });
  });
});
```

## Pre-Demo Validation Checklist

### 60-Minute Critical Tests
```bash
# 1. Run golden dataset validation (5 min)
npm run test:golden

# 2. Test what-if immutability (5 min)
npm run test:whatif

# 3. Test survey ingestion with real files (10 min)
npm run test:ingest -- --data=production-samples/

# 4. Visual regression for error states (10 min)
npm run test:visual -- --update-snapshots

# 5. E2E critical path with preview env (30 min)
npm run test:e2e:preview -- --headed

# Generate test report
npm run test:report
```

### Validation Output
```
✅ Financial Invariants: 12/12 passing
✅ Golden Dataset: 480/480 rows validated
✅ What-If Immutability: All reversible
✅ Survey Ingestion: 5 encodings handled
✅ Visual Regression: 0 unexpected changes
✅ E2E Critical Path: 6/6 journeys passing
✅ Performance P95: 42ms (target: <50ms)
✅ Cache Hit Rate: 89% (target: >80%)

🚀 System ready for demo
```

---

**Document Owner:** QA Lead & Finance SME
**Last Updated:** January 2025
**Domain Version:** 1.0.0