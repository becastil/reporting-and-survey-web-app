/**
 * Test Data Factory for Money Meter Component
 * Provides consistent, reusable test data scenarios
 */

import { MoneyMeterProps } from '@/components/dashboard/MoneyMeter';

export class MoneyMeterFactory {
  /**
   * Default valid props
   */
  static default(): MoneyMeterProps {
    return {
      value: 234689200, // $2,346,892
    };
  }

  /**
   * Props with trend data
   */
  static withTrend(direction: 'up' | 'down' | 'neutral' = 'up'): MoneyMeterProps {
    const base = 200000000;
    const values = {
      up: { value: 250000000, previousValue: base },
      down: { value: 180000000, previousValue: base },
      neutral: { value: base, previousValue: base },
    };
    return values[direction];
  }

  /**
   * Interactive props with click handler
   */
  static interactive(onClick = jest.fn()): MoneyMeterProps {
    return {
      ...this.default(),
      onClick,
    };
  }

  /**
   * Edge case scenarios
   */
  static edge = {
    zero: (): MoneyMeterProps => ({ value: 0 }),
    negative: (): MoneyMeterProps => ({ value: -100000 }),
    maximum: (): MoneyMeterProps => ({ value: Number.MAX_SAFE_INTEGER }),
    nan: (): MoneyMeterProps => ({ value: NaN }),
    veryLarge: (): MoneyMeterProps => ({ value: 1523456700 }), // $15M+
  };

  /**
   * Performance testing scenarios
   */
  static performance = {
    withBadge: (): MoneyMeterProps => ({
      ...this.default(),
      showPerformanceBadge: true,
    }),
    withoutBadge: (): MoneyMeterProps => ({
      ...this.default(),
      showPerformanceBadge: false,
    }),
    fastAnimation: (): MoneyMeterProps => ({
      ...this.default(),
      animationDuration: 1000,
    }),
    noAnimation: (): MoneyMeterProps => ({
      ...this.default(),
      animationDuration: 0,
    }),
  };

  /**
   * Accessibility testing scenarios
   */
  static accessibility = {
    withCustomTestId: (): MoneyMeterProps => ({
      ...this.default(),
      testId: 'custom-money-meter',
    }),
    withClassName: (): MoneyMeterProps => ({
      ...this.default(),
      className: 'custom-class',
    }),
  };

  /**
   * Build custom props by merging with defaults
   */
  static build(overrides: Partial<MoneyMeterProps> = {}): MoneyMeterProps {
    return {
      ...this.default(),
      ...overrides,
    };
  }

  /**
   * Generate random realistic value
   */
  static random(): MoneyMeterProps {
    const min = 100000; // $1,000
    const max = 10000000; // $100,000
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    return { value: value * 100 }; // Convert to cents
  }

  /**
   * Batch generation for stress testing
   */
  static batch(count: number, generator = this.random): MoneyMeterProps[] {
    return Array.from({ length: count }, () => generator());
  }
}