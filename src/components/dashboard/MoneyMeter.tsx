/**
 * MoneyMeter Component
 * Displays total savings opportunity with animated value display
 *
 * Performance Target: <50ms updates, 60fps animation
 * Accessibility: WCAG 2.1 AA compliant
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { formatCurrency } from '@/utils/formatCurrency';
import { withPerformanceTracking } from '@/utils/withPerformanceTracking';
import styles from './MoneyMeter.module.css';

export interface MoneyMeterProps {
  /** Current savings value in cents */
  value: number;
  /** Previous value for trend calculation */
  previousValue?: number;
  /** Callback when meter is clicked */
  onClick?: () => void;
  /** Override animation duration (ms) */
  animationDuration?: number;
  /** Show performance badge */
  showPerformanceBadge?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * MoneyMeter displays animated currency value with performance tracking
 */
export const MoneyMeter: React.FC<MoneyMeterProps> = ({
  value,
  previousValue,
  onClick,
  animationDuration = 3000,
  showPerformanceBadge = true,
  className = '',
  testId = 'money-meter',
}) => {
  // Runtime validation and sanitization
  const safeValue = typeof value === 'number' && !isNaN(value) && value >= 0 ? value : 0;
  const safePreviousValue =
    typeof previousValue === 'number' && !isNaN(previousValue) && previousValue >= 0
      ? previousValue
      : undefined;
  const safeDuration =
    typeof animationDuration === 'number' && animationDuration > 0
      ? Math.min(animationDuration, 10000) // Cap at 10 seconds
      : 3000;

  const [isAnimating, setIsAnimating] = useState(false);
  const [calculationTime, setCalculationTime] = useState<number>(0);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Spring animation for smooth value transitions
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Transform spring value to display value
  const displayValue = useTransform(spring, (latest) => {
    return Math.round(latest);
  });

  // Calculate trend if previous value provided
  const trend = useMemo(() => {
    if (!safePreviousValue || safePreviousValue === 0) return null;

    const difference = safeValue - safePreviousValue;
    const percentage = (difference / safePreviousValue) * 100;

    return {
      direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'neutral',
      percentage: Math.abs(percentage),
      difference: Math.abs(difference),
    };
  }, [safeValue, safePreviousValue]);

  // Animate value changes
  useEffect(() => {
    const startTime = performance.now();
    setIsAnimating(true);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      spring.set(safeValue);
      setIsAnimating(false);
      setCalculationTime(performance.now() - startTime);
      return;
    }

    // Animate from 0 to value
    spring.set(0);
    const animation = spring.animate(safeValue, {
      duration: safeDuration / 1000,
      ease: [0.4, 0, 0.2, 1], // cubic-bezier
      onComplete: () => {
        setIsAnimating(false);
        setCalculationTime(performance.now() - startTime);
      },
    });

    return () => {
      animation.stop();
    };
  }, [safeValue, spring, safeDuration]);

  // Handle keyboard activation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  // Format display value with animation
  const [formattedValue, setFormattedValue] = useState('$0');

  useEffect(() => {
    const unsubscribe = displayValue.on('change', (latest) => {
      setFormattedValue(formatCurrency(latest));
    });

    return unsubscribe;
  }, [displayValue]);

  return (
    <div
      ref={containerRef}
      className={`money-meter ${className}`.trim()}
      data-testid={testId}
      role="region"
      aria-label="Total Savings Opportunity"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="money-meter__container">
        {/* Main Value Display */}
        <motion.button
          className="money-meter__value-container"
          onClick={onClick}
          onKeyDown={handleKeyDown}
          disabled={!onClick}
          tabIndex={onClick ? 0 : -1}
          aria-label={`Total savings opportunity: ${formattedValue}. ${onClick ? 'Click to view breakdown' : ''}`}
          whileHover={onClick ? { scale: 1.02 } : {}}
          whileTap={onClick ? { scale: 0.98 } : {}}
        >
          <motion.div
            className="money-meter__value"
            data-animating={isAnimating}
            style={{ willChange: isAnimating ? 'transform' : 'auto' }}
          >
            {formattedValue}
          </motion.div>

          {/* Trend Indicator */}
          {trend && (
            <div className="money-meter__trend" data-direction={trend.direction}>
              <span className="money-meter__trend-icon" aria-hidden="true">
                {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '—'}
              </span>
              <span className="money-meter__trend-text">{trend.percentage.toFixed(1)}%</span>
              <span className="sr-only">
                {trend.direction === 'up'
                  ? 'Increased'
                  : trend.direction === 'down'
                    ? 'Decreased'
                    : 'No change'}
                by {trend.percentage.toFixed(1)} percent
              </span>
            </div>
          )}
        </motion.button>

        {/* Labels */}
        <div className="money-meter__labels">
          <h2 className="money-meter__title">Total Savings Opportunity</h2>
          {previousValue !== undefined && (
            <p className="money-meter__subtitle">vs. {formatCurrency(previousValue)} previous</p>
          )}
        </div>

        {/* Performance Badge */}
        {showPerformanceBadge && calculationTime > 0 && (
          <div
            className="money-meter__performance-badge"
            role="status"
            aria-label={`Calculation completed in ${Math.round(calculationTime)} milliseconds`}
          >
            <span className="money-meter__performance-value">{Math.round(calculationTime)}ms</span>
          </div>
        )}

        {/* Click Hint */}
        {onClick && !isAnimating && (
          <div className="money-meter__hint" aria-hidden="true">
            Click for breakdown
          </div>
        )}
      </div>
    </div>
  );
};

// Export with performance tracking HOC
export default withPerformanceTracking(MoneyMeter, 'MoneyMeter');
