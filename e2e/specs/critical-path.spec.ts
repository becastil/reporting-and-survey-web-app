import { test, expect } from '@playwright/test';

/**
 * Critical Path E2E Tests
 * These tests verify the most important user journeys
 */

test.describe('Critical User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'test-token');
    });
  });

  test('CSV Upload to Dashboard Flow', async ({ page }) => {
    // Navigate to upload page
    await page.goto('/survey/upload');
    
    // Upload CSV file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('test-data/sample-survey.csv');
    
    // Wait for validation
    await expect(page.locator('.validation-success')).toBeVisible();
    await expect(page.locator('text=1,245 rows validated')).toBeVisible();
    
    // Submit upload
    await page.click('button:has-text("Process Data")');
    
    // Wait for processing
    await expect(page.locator('.processing-indicator')).toBeVisible();
    await page.waitForSelector('.processing-complete', { timeout: 10000 });
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Verify data appears in dashboard
    await expect(page.locator('.money-meter')).toContainText('$');
    await expect(page.locator('.reporting-grid tbody tr')).toHaveCount(12);
  });

  test('What-If Modeling Updates in Real-Time', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for initial load
    await page.waitForSelector('.money-meter');
    const initialValue = await page.locator('.money-meter .value').textContent();
    
    // Adjust employee count slider
    const employeeSlider = page.locator('input[name="employeeCount"]');
    await employeeSlider.fill('2.5');
    
    // Verify real-time update
    await expect(page.locator('.money-meter .value')).not.toHaveText(initialValue!);
    
    // Verify performance badge shows <50ms
    const perfBadge = page.locator('.performance-badge');
    const perfText = await perfBadge.textContent();
    const ms = parseInt(perfText?.replace('ms', '') || '0');
    expect(ms).toBeLessThan(50);
    
    // Adjust rebate timing
    await page.locator('input[name="rebateTiming"]').fill('1');
    
    // Verify impact display
    await expect(page.locator('.impact-summary')).toContainText('Impact: $');
    await expect(page.locator('.original-value')).toBeVisible();
    await expect(page.locator('.adjusted-value')).toBeVisible();
    
    // Reset adjustments
    await page.click('button:has-text("Reset")');
    await expect(page.locator('.money-meter .value')).toHaveText(initialValue!);
  });

  test('Filter Bar Synchronizes Across Modules', async ({ page }) => {
    // Start in Survey module
    await page.goto('/survey');
    
    // Apply filters
    await page.selectOption('select[name="organization"]', 'Acme Corp');
    await page.selectOption('select[name="period"]', '2025-01');
    
    // Navigate to Reporting module
    await page.click('a:has-text("Reporting")');
    
    // Verify filters persisted
    await expect(page.locator('select[name="organization"]')).toHaveValue('Acme Corp');
    await expect(page.locator('select[name="period"]')).toHaveValue('2025-01');
    
    // Verify data is filtered
    await expect(page.locator('.filter-chip:has-text("Acme Corp")')).toBeVisible();
    await expect(page.locator('.filter-chip:has-text("January 2025")')).toBeVisible();
    
    // Clear filters
    await page.click('button:has-text("Clear All")');
    await expect(page.locator('.filter-chip')).toHaveCount(0);
  });

  test('Peer Comparison Shows Similar Organizations', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for cohort matching
    await page.waitForSelector('.organizations-like-yours');
    
    // Verify 5 similar orgs displayed
    await expect(page.locator('.peer-org-card')).toHaveCount(5);
    
    // Verify similarity scores
    const scores = await page.locator('.similarity-score').allTextContents();
    scores.forEach(score => {
      const value = parseFloat(score.replace('%', ''));
      expect(value).toBeGreaterThan(70); // At least 70% similar
    });
    
    // Apply as filter
    await page.click('button:has-text("Apply as Filter")');
    
    // Verify grid filtered to cohort
    const gridRows = await page.locator('.reporting-grid tbody tr').count();
    expect(gridRows).toBe(5);
  });

  test('Export Generates Complete Report', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Open export dialog
    await page.click('button:has-text("Export")');
    
    // Select export options
    await page.check('input[name="includeCharts"]');
    await page.check('input[name="includeRawData"]');
    await page.selectOption('select[name="format"]', 'pdf');
    
    // Start export
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Generate Report")');
    
    // Verify download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('variance-report');
    expect(download.suggestedFilename()).toEndWith('.pdf');
  });

  test('Demo Mode Completes Successfully', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Start Demo")');
    
    // Verify demo overlay appears
    await expect(page.locator('.demo-overlay')).toBeVisible();
    await expect(page.locator('.demo-step-indicator')).toHaveText('Step 1 of 6');
    
    // Complete all 6 steps
    for (let step = 1; step <= 6; step++) {
      await expect(page.locator('.demo-step-indicator')).toHaveText(`Step ${step} of 6`);
      
      if (step < 6) {
        await page.click('button:has-text("Next")');
      }
    }
    
    // Finish demo
    await page.click('button:has-text("Finish Demo")');
    
    // Verify completion modal
    await expect(page.locator('.demo-complete-modal')).toBeVisible();
    await expect(page.locator('.demo-complete-modal')).toContainText('Demo Complete');
  });
});

test.describe('Performance Benchmarks', () => {
  test('Dashboard loads in under 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(2000);
  });

  test('Calculations complete in under 50ms', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Trigger calculation
    await page.locator('input[name="employeeCount"]').fill('5');
    
    // Check performance badge
    const badge = await page.locator('.performance-badge').textContent();
    const ms = parseInt(badge?.replace('ms', '') || '0');
    
    expect(ms).toBeLessThan(50);
  });

  test('Grid renders 500 rows smoothly', async ({ page }) => {
    await page.goto('/dashboard?rows=500');
    
    const startTime = Date.now();
    await page.waitForSelector('.reporting-grid tbody tr:nth-child(100)');
    const renderTime = Date.now() - startTime;
    
    expect(renderTime).toBeLessThan(500);
    
    // Verify virtual scrolling works
    await page.evaluate(() => {
      document.querySelector('.grid-container')?.scrollTo(0, 10000);
    });
    
    await expect(page.locator('.reporting-grid tbody tr')).toBeVisible();
  });
});

test.describe('Accessibility Compliance', () => {
  test('Dashboard passes accessibility audit', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Inject axe-core
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js'
    });
    
    // Run accessibility audit
    const violations = await page.evaluate(() => {
      return new Promise((resolve) => {
        // @ts-ignore
        window.axe.run((err, results) => {
          resolve(results.violations);
        });
      });
    });
    
    // @ts-ignore
    expect(violations).toHaveLength(0);
  });

  test('Keyboard navigation works throughout app', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveClass(/filter-dropdown/);
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveClass(/money-meter/);
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveClass(/slider-input/);
    
    // Test escape key closes modals
    await page.click('button:has-text("Export")');
    await expect(page.locator('.export-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.export-modal')).not.toBeVisible();
  });
});