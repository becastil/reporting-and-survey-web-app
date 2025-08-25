/**
 * Feature Flag Configuration
 * Controls progressive rollout and provides fallbacks for demo stability
 */

export interface FeatureConfig {
  enabled: boolean;
  fallback: string;
  required: boolean;
  description?: string;
}

export const FEATURE_FLAGS: Record<string, FeatureConfig> = {
  // Phase 1 - Foundation (Required for all functionality)
  csvUpload: {
    enabled: true,
    fallback: 'demo-data',
    required: true,
    description: 'CSV file upload and validation'
  },
  calculations: {
    enabled: true,
    fallback: 'cached-results',
    required: true,
    description: 'PEPM and variance calculations'
  },
  reportingGrid: {
    enabled: true,
    fallback: 'static-table',
    required: true,
    description: 'Interactive data grid'
  },
  
  // Phase 2 - Interactive Features (Critical for demo)
  whatIfSliders: {
    enabled: false,
    fallback: 'static-scenarios',
    required: true,
    description: 'Real-time what-if modeling'
  },
  moneyMeter: {
    enabled: false,
    fallback: 'static-value',
    required: true,
    description: 'Animated savings opportunity display'
  },
  performanceBadge: {
    enabled: true,
    fallback: 'hide-badge',
    required: false,
    description: 'Sub-50ms performance indicator'
  },
  
  // Phase 3 - Intelligence Layer (Important but not critical)
  cohortMatching: {
    enabled: false,
    fallback: 'pre-selected-peers',
    required: false,
    description: 'K-NN peer organization matching'
  },
  filterBar: {
    enabled: false,
    fallback: 'basic-filters',
    required: false,
    description: 'Unified cross-module filtering'
  },
  benchmarkOverlays: {
    enabled: false,
    fallback: 'no-benchmarks',
    required: false,
    description: 'Peer comparison overlays'
  },
  
  // Phase 4 - Visualization (Nice-to-have)
  charts: {
    enabled: false,
    fallback: 'static-images',
    required: false,
    description: 'Plotly.js interactive charts'
  },
  waterfallChart: {
    enabled: false,
    fallback: 'table-view',
    required: false,
    description: 'Variance breakdown visualization'
  },
  exports: {
    enabled: false,
    fallback: 'csv-only',
    required: false,
    description: 'Multi-format export capability'
  },
  
  // Phase 5 - Demo Experience
  demoMode: {
    enabled: false,
    fallback: 'manual-walkthrough',
    required: true,
    description: '6-step guided tour'
  },
  focusToggle: {
    enabled: false,
    fallback: 'full-view-only',
    required: false,
    description: 'Executive vs analyst view toggle'
  },
};

/**
 * Demo Safe Mode Configuration
 * Quick toggles for demo stability
 */
export const DEMO_SAFE_MODE = {
  disableAnimations: false,
  useCachedData: false,
  limitDataSize: false,
  disableExports: false,
  simplifiedView: false,
  mockExternalServices: false,
  reduceDataRefresh: false,
};

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (featureName: keyof typeof FEATURE_FLAGS): boolean => {
  const feature = FEATURE_FLAGS[featureName];
  if (!feature) {
    console.warn(`Unknown feature flag: ${featureName}`);
    return false;
  }
  
  // In development, check environment variable overrides
  if (process.env.NODE_ENV === 'development') {
    const envOverride = process.env[`NEXT_PUBLIC_FEATURE_${featureName.toUpperCase()}`];
    if (envOverride !== undefined) {
      return envOverride === 'true';
    }
  }
  
  return feature.enabled;
};

/**
 * Get fallback for a feature
 */
export const getFeatureFallback = (featureName: keyof typeof FEATURE_FLAGS): string => {
  const feature = FEATURE_FLAGS[featureName];
  return feature?.fallback || 'feature-disabled';
};

/**
 * Toggle features for demo mode
 * Ensures critical features are enabled and risky ones can be disabled
 */
export const configureForDemo = (safeMode: boolean = false) => {
  // Ensure critical features are on
  FEATURE_FLAGS.csvUpload.enabled = true;
  FEATURE_FLAGS.calculations.enabled = true;
  FEATURE_FLAGS.reportingGrid.enabled = true;
  
  // These must work for demo success
  if (!safeMode) {
    FEATURE_FLAGS.whatIfSliders.enabled = true;
    FEATURE_FLAGS.moneyMeter.enabled = true;
    FEATURE_FLAGS.demoMode.enabled = true;
  }
  
  // Apply safe mode if needed
  if (safeMode) {
    Object.assign(DEMO_SAFE_MODE, {
      disableAnimations: true,
      useCachedData: true,
      limitDataSize: true,
      disableExports: true,
      simplifiedView: true,
      mockExternalServices: true,
      reduceDataRefresh: true,
    });
  }
};

/**
 * Get feature readiness report
 */
export const getFeatureReadiness = () => {
  const phases = {
    phase1: ['csvUpload', 'calculations', 'reportingGrid'],
    phase2: ['whatIfSliders', 'moneyMeter', 'performanceBadge'],
    phase3: ['cohortMatching', 'filterBar', 'benchmarkOverlays'],
    phase4: ['charts', 'waterfallChart', 'exports'],
    phase5: ['demoMode', 'focusToggle'],
  };
  
  const readiness: Record<string, any> = {};
  
  for (const [phase, features] of Object.entries(phases)) {
    const enabled = features.filter(f => FEATURE_FLAGS[f as keyof typeof FEATURE_FLAGS]?.enabled);
    const required = features.filter(f => FEATURE_FLAGS[f as keyof typeof FEATURE_FLAGS]?.required);
    
    readiness[phase] = {
      total: features.length,
      enabled: enabled.length,
      required: required.length,
      complete: enabled.length === features.length,
      critical: required.every(f => FEATURE_FLAGS[f as keyof typeof FEATURE_FLAGS]?.enabled),
    };
  }
  
  return readiness;
};

/**
 * Check if demo is ready
 */
export const isDemoReady = (): { ready: boolean; missing: string[] } => {
  const requiredFeatures = Object.entries(FEATURE_FLAGS)
    .filter(([_, config]) => config.required)
    .map(([name, _]) => name);
  
  const missing = requiredFeatures.filter(
    feature => !FEATURE_FLAGS[feature as keyof typeof FEATURE_FLAGS].enabled
  );
  
  return {
    ready: missing.length === 0,
    missing,
  };
};

/**
 * Export configuration for runtime access
 */
export default {
  features: FEATURE_FLAGS,
  safeMode: DEMO_SAFE_MODE,
  isEnabled: isFeatureEnabled,
  getFallback: getFeatureFallback,
  configureForDemo,
  getReadiness: getFeatureReadiness,
  isDemoReady,
};