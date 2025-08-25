/**
 * Performance Tracking Higher-Order Component
 * Monitors component render times and updates
 */

import React, { useEffect, useRef, ComponentType } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  updateCount: number;
  lastUpdate: number;
}

// Global performance store
const performanceStore = new Map<string, PerformanceMetrics>();

/**
 * HOC that tracks component performance metrics
 * @param Component - The component to wrap
 * @param componentName - Name for tracking
 * @returns Wrapped component with performance tracking
 */
export function withPerformanceTracking<P extends object>(
  Component: ComponentType<P>,
  componentName: string
): ComponentType<P> {
  return React.memo((props: P) => {
    const renderStartTime = useRef<number>(performance.now());
    const updateCount = useRef<number>(0);
    const isFirstRender = useRef<boolean>(true);

    useEffect(() => {
      const renderEndTime = performance.now();
      const renderTime = renderEndTime - renderStartTime.current;

      updateCount.current += 1;

      // Update metrics in store
      const metrics: PerformanceMetrics = {
        componentName,
        renderTime,
        updateCount: updateCount.current,
        lastUpdate: renderEndTime,
      };

      performanceStore.set(componentName, metrics);

      // Log performance in development
      if (process.env.NODE_ENV === 'development') {
        const logStyle =
          renderTime > 50 ? 'color: red' : renderTime > 16 ? 'color: orange' : 'color: green';
        console.log(
          `%c[Performance] ${componentName}: ${renderTime.toFixed(2)}ms (Update #${updateCount.current})`,
          logStyle
        );
      }

      // Report to monitoring service if configured
      if (typeof window !== 'undefined' && (window as any).__PERF_MONITOR__) {
        (window as any).__PERF_MONITOR__.report({
          component: componentName,
          renderTime,
          updateCount: updateCount.current,
          timestamp: Date.now(),
        });
      }

      // Mark first render complete
      if (isFirstRender.current) {
        isFirstRender.current = false;
      }

      // Reset render start time for next update
      renderStartTime.current = performance.now();
    });

    // Add performance mark for tracing
    useEffect(() => {
      if (typeof window !== 'undefined' && window.performance && window.performance.mark) {
        const markName = `${componentName}-render-start`;
        window.performance.mark(markName);

        return () => {
          const endMarkName = `${componentName}-render-end`;
          const measureName = `${componentName}-render`;

          try {
            window.performance.mark(endMarkName);
            window.performance.measure(measureName, markName, endMarkName);
          } catch (e) {
            // Ignore errors from performance API
          }
        };
      }
    }, []);

    return <Component {...props} />;
  });
}

/**
 * Hook to access performance metrics
 * @param componentName - Name of component to get metrics for
 * @returns Performance metrics or null
 */
export function usePerformanceMetrics(componentName: string): PerformanceMetrics | null {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = performanceStore.get(componentName);
      if (stored) {
        setMetrics(stored);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [componentName]);

  return metrics;
}

/**
 * Get all performance metrics
 * @returns Map of all tracked metrics
 */
export function getAllPerformanceMetrics(): Map<string, PerformanceMetrics> {
  return new Map(performanceStore);
}

/**
 * Clear performance metrics
 * @param componentName - Optional specific component to clear
 */
export function clearPerformanceMetrics(componentName?: string): void {
  if (componentName) {
    performanceStore.delete(componentName);
  } else {
    performanceStore.clear();
  }
}

/**
 * Performance observer for long tasks
 */
export function initPerformanceObserver(): void {
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn(`[Performance] Long task detected: ${entry.duration.toFixed(2)}ms`, entry);
        }
      }
    });

    observer.observe({ entryTypes: ['longtask', 'measure'] });
  } catch (e) {
    // PerformanceObserver not supported
  }
}
