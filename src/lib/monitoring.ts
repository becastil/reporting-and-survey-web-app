import * as Sentry from '@sentry/nextjs';

// Initialize Sentry for error tracking
export const initMonitoring = () => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: process.env.NODE_ENV === 'development',
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      beforeSend(event, hint) {
        // Filter out non-critical errors in production
        if (process.env.NODE_ENV === 'production') {
          if (event.level === 'log' || event.level === 'debug') {
            return null;
          }
        }
        return event;
      },
    });
  }
};

// Performance monitoring utility
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private readonly MAX_SAMPLES = 100;
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  // Track operation performance
  async track<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();
    const transaction = Sentry.getCurrentHub().getScope().getTransaction();
    const span = transaction?.startChild({
      op: operation,
      description: `Performance tracking: ${operation}`,
    });
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      // Record metric
      this.recordMetric(operation, duration);
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PERF] ${operation}: ${duration.toFixed(2)}ms`, metadata);
      }
      
      // Send to Sentry if slow
      if (duration > 50) {
        Sentry.captureMessage(`Slow operation: ${operation}`, {
          level: 'warning',
          extra: {
            duration,
            operation,
            ...metadata,
          },
        });
      }
      
      span?.finish();
      return result;
    } catch (error) {
      span?.setStatus('internal_error');
      span?.finish();
      
      // Log error with context
      Sentry.captureException(error, {
        contexts: {
          performance: {
            operation,
            metadata,
          },
        },
      });
      
      throw error;
    }
  }
  
  private recordMetric(operation: string, duration: number) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const samples = this.metrics.get(operation)!;
    samples.push(duration);
    
    // Keep only recent samples
    if (samples.length > this.MAX_SAMPLES) {
      samples.shift();
    }
  }
  
  // Get performance statistics
  getStats(operation: string): {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
    count: number;
  } | null {
    const samples = this.metrics.get(operation);
    if (!samples || samples.length === 0) {
      return null;
    }
    
    const sorted = [...samples].sort((a, b) => a - b);
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    
    return {
      avg,
      p50: this.percentile(sorted, 50),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99),
      count: samples.length,
    };
  }
  
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((sorted.length * p) / 100) - 1;
    return sorted[Math.max(0, index)];
  }
  
  // Performance badge for UI display
  getPerformanceBadge(duration: number): {
    label: string;
    color: string;
    emoji: string;
  } {
    if (duration < 50) {
      return { label: `${duration.toFixed(0)}ms`, color: 'green', emoji: '⚡' };
    } else if (duration < 100) {
      return { label: `${duration.toFixed(0)}ms`, color: 'yellow', emoji: '⏱️' };
    } else {
      return { label: `${duration.toFixed(0)}ms`, color: 'red', emoji: '🐢' };
    }
  }
}

// Export singleton instance
export const perfMonitor = PerformanceMonitor.getInstance();

// Custom hooks for React components
export const usePerformanceTracking = (componentName: string) => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Track component render performance
    const renderStart = performance.now();
    
    // Use useEffect to track mount time
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        const renderTime = performance.now() - renderStart;
        if (renderTime > 16) { // More than one frame (60fps)
          console.warn(`[PERF] Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
        }
      });
    }
  }
};