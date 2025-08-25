/**
 * Page Object Model for Dashboard
 * Encapsulates dashboard interactions for E2E tests
 */

import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly moneyMeter: Locator;
  readonly moneyMeterValue: Locator;
  readonly moneyMeterTrend: Locator;
  readonly performanceBadge: Locator;
  readonly reportingGrid: Locator;
  readonly whatIfPanel: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Money Meter selectors
    this.moneyMeter = page.getByTestId('money-meter');
    this.moneyMeterValue = page.getByRole('region', { name: /total savings opportunity/i });
    this.moneyMeterTrend = this.moneyMeter.locator('[data-testid="trend-indicator"]');
    this.performanceBadge = page.getByRole('status');
    
    // Other dashboard components
    this.reportingGrid = page.getByTestId('reporting-grid');
    this.whatIfPanel = page.getByTestId('what-if-panel');
  }

  /**
   * Navigate to dashboard
   */
  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for Money Meter animation to complete
   */
  async waitForMoneyMeterAnimation() {
    await this.page.waitForTimeout(3500); // Default animation + buffer
    await expect(this.moneyMeterValue).toBeVisible();
  }

  /**
   * Get the current Money Meter value
   */
  async getMoneyMeterValue(): Promise<string> {
    await this.waitForMoneyMeterAnimation();
    const value = await this.moneyMeterValue.textContent();
    return value || '';
  }

  /**
   * Check if trend indicator shows expected direction
   */
  async assertTrendDirection(direction: 'up' | 'down' | 'neutral') {
    const trendElement = await this.moneyMeterTrend;
    await expect(trendElement).toHaveAttribute('data-direction', direction);
  }

  /**
   * Click Money Meter to open breakdown
   */
  async clickMoneyMeter() {
    await this.moneyMeter.click();
    await this.page.waitForSelector('[data-testid="breakdown-modal"]');
  }

  /**
   * Verify performance badge shows and has valid time
   */
  async assertPerformanceBadge() {
    await expect(this.performanceBadge).toBeVisible();
    const text = await this.performanceBadge.textContent();
    expect(text).toMatch(/\d+ms/);
    
    // Parse and validate performance time
    const time = parseInt(text?.match(/(\d+)ms/)?.[1] || '0');
    expect(time).toBeLessThan(50); // Should meet <50ms target
  }

  /**
   * Test responsive behavior
   */
  async testResponsive() {
    // Mobile
    await this.page.setViewportSize({ width: 375, height: 667 });
    await expect(this.moneyMeter).toBeVisible();
    
    // Tablet
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await expect(this.moneyMeter).toBeVisible();
    
    // Desktop
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    await expect(this.moneyMeter).toBeVisible();
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation() {
    await this.page.keyboard.press('Tab');
    await expect(this.moneyMeter).toBeFocused();
    
    await this.page.keyboard.press('Enter');
    await this.page.waitForSelector('[data-testid="breakdown-modal"]');
    
    await this.page.keyboard.press('Escape');
    await expect(this.page.locator('[data-testid="breakdown-modal"]')).not.toBeVisible();
  }

  /**
   * Test accessibility
   */
  async testAccessibility() {
    // Check ARIA labels
    await expect(this.moneyMeterValue).toHaveAttribute('aria-label', 'Total Savings Opportunity');
    await expect(this.moneyMeterValue).toHaveAttribute('aria-live', 'polite');
    
    // Check reduced motion
    await this.page.emulateMedia({ reducedMotion: 'reduce' });
    await this.goto();
    // Animation should be instant with reduced motion
    await expect(this.moneyMeterValue).toBeVisible({ timeout: 100 });
  }

  /**
   * Capture screenshot for visual regression
   */
  async captureScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `screenshots/${name}.png`,
      fullPage: false,
      clip: await this.moneyMeter.boundingBox() || undefined
    });
  }
}