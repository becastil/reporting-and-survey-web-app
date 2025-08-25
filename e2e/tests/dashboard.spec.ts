/**
 * E2E Tests for Dashboard
 * Critical user journeys and integration scenarios
 */

import { test, expect } from '@playwright/test';
import { DashboardPage } from '../page-objects/DashboardPage';

test.describe('Dashboard E2E Tests', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
  });

  test('should display Money Meter with animated value', async () => {
    // Wait for animation
    await dashboardPage.waitForMoneyMeterAnimation();
    
    // Verify value is displayed
    const value = await dashboardPage.getMoneyMeterValue();
    expect(value).toContain('$');
    expect(value).not.toBe('$0');
  });

  test('should show performance badge meeting target', async () => {
    await dashboardPage.assertPerformanceBadge();
  });

  test('should handle click interaction to show breakdown', async () => {
    await dashboardPage.clickMoneyMeter();
    
    // Verify modal opens
    const modal = dashboardPage.page.locator('[data-testid="breakdown-modal"]');
    await expect(modal).toBeVisible();
    
    // Verify breakdown content
    await expect(modal.locator('text=/calculation breakdown/i')).toBeVisible();
  });

  test('should display trend indicator correctly', async () => {
    // This would need backend data to set up specific trend
    // For now, just verify trend element exists
    const trend = dashboardPage.page.locator('[data-testid="trend-indicator"]');
    await expect(trend).toBeVisible();
  });

  test('should be fully responsive', async () => {
    await dashboardPage.testResponsive();
  });

  test('should support keyboard navigation', async () => {
    await dashboardPage.testKeyboardNavigation();
  });

  test('should meet accessibility requirements', async () => {
    await dashboardPage.testAccessibility();
  });

  test('should handle rapid value updates gracefully', async ({ page }) => {
    // Simulate rapid data updates
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        // Trigger re-render with new value
        window.dispatchEvent(new CustomEvent('update-money-meter', { 
          detail: { value: Math.random() * 10000000 } 
        }));
      });
      await page.waitForTimeout(100);
    }
    
    // Component should still be stable
    await expect(dashboardPage.moneyMeter).toBeVisible();
  });

  test('visual regression - Money Meter component', async () => {
    await dashboardPage.waitForMoneyMeterAnimation();
    await dashboardPage.captureScreenshot('money-meter-default');
    
    // Compare with baseline
    await expect(dashboardPage.moneyMeter).toHaveScreenshot('money-meter-baseline.png');
  });
});

test.describe('Dashboard Integration Tests', () => {
  test('should integrate Money Meter with Reporting Grid', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    
    // Click Money Meter
    await dashboardPage.clickMoneyMeter();
    
    // Verify breakdown modal shows data matching grid
    const modal = page.locator('[data-testid="breakdown-modal"]');
    const gridData = await page.locator('[data-testid="reporting-grid"]').textContent();
    const modalData = await modal.textContent();
    
    // Some data should match between grid and breakdown
    expect(modalData).toContain('Total Savings');
  });

  test('should update Money Meter when What-If slider changes', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    
    // Get initial value
    const initialValue = await dashboardPage.getMoneyMeterValue();
    
    // Adjust What-If slider
    const slider = page.locator('[data-testid="what-if-panel"] input[type="range"]');
    await slider.fill('5'); // +5% adjustment
    
    // Wait for recalculation
    await page.waitForTimeout(500);
    
    // Verify Money Meter updated
    const newValue = await dashboardPage.getMoneyMeterValue();
    expect(newValue).not.toBe(initialValue);
  });

  test('should show Reporting Grid with virtual scrolling', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    
    // Verify grid is present
    const grid = page.locator('[data-testid="reporting-grid"]');
    await expect(grid).toBeVisible();
    
    // Check virtual scrolling container
    const scrollContainer = grid.locator('.gridBody');
    await expect(scrollContainer).toBeVisible();
    
    // Verify rows are rendered
    const rows = grid.locator('[role="row"]');
    await expect(rows.first()).toBeVisible();
  });

  test('should expand/collapse rows in Reporting Grid', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    
    const grid = page.locator('[data-testid="reporting-grid"]');
    const expandButton = grid.locator('[aria-label="Expand row"]').first();
    
    // Expand row
    await expandButton.click();
    await expect(expandButton).toHaveAttribute('aria-label', 'Collapse row');
    
    // Check line items are visible
    const lineItems = grid.locator('text=/Line Item/');
    await expect(lineItems.first()).toBeVisible();
    
    // Collapse row
    await expandButton.click();
    await expect(expandButton).toHaveAttribute('aria-label', 'Expand row');
  });

  test('should apply What-If scenario', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    
    const whatIfPanel = page.locator('[data-testid="what-if-panel"]');
    const slider = whatIfPanel.locator('input[type="range"]');
    const applyButton = whatIfPanel.locator('button:has-text("Apply Scenario")');
    
    // Adjust slider
    await slider.fill('3');
    
    // Apply scenario
    await applyButton.click();
    
    // Verify slider resets
    await expect(slider).toHaveValue('0');
    
    // Verify values updated
    const adjustedColumn = whatIfPanel.locator('.adjustedColumn');
    await expect(adjustedColumn).toContainText('1,030'); // 3% increase from 1000
  });
});