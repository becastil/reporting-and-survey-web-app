/**
 * Demo Configuration
 * Controls demo mode behavior, sample data, and presentation settings
 */

export interface DemoConfig {
  enabled: boolean;
  features: DemoFeatures;
  data: DemoDataConfig;
  presentation: PresentationConfig;
  analytics: AnalyticsConfig;
}

export interface DemoFeatures {
  csvUpload: boolean;
  whatIfModeling: boolean;
  peerComparison: boolean;
  advancedExport: boolean;
  moneyMeterAnimation: boolean;
  performanceBadges: boolean;
  guidedTour: boolean;
  autoProgress: boolean;
  tooltips: boolean;
}

export interface DemoDataConfig {
  organizationId: string;
  organizationName: string;
  sampleFile: string;
  totalSavings: number;
  employeeCount: number;
  memberCount: number;
  refreshInterval: number | null;
  useLiveCalculations: boolean;
  mockNetworkDelay: number;
}

export interface PresentationConfig {
  animationSpeed: 'slow' | 'normal' | 'fast';
  highlightDelay: number;
  autoPlayDelay: number;
  showPerformanceMetrics: boolean;
  showCalculationFormulas: boolean;
  enableKeyboardShortcuts: boolean;
  watermarkText: string | null;
}

export interface AnalyticsConfig {
  trackInteractions: boolean;
  trackTiming: boolean;
  reportingEndpoint: string | null;
  sessionId: string | null;
}

// Demo mode detection
export const isDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    window.location.hostname.includes('demo') ||
    window.location.search.includes('demo=true') ||
    localStorage.getItem('demo-mode') === 'true' ||
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  );
};

// Default demo configuration
export const DEFAULT_DEMO_CONFIG: DemoConfig = {
  enabled: isDemoMode(),
  
  features: {
    csvUpload: true,
    whatIfModeling: true,
    peerComparison: true,
    advancedExport: true,
    moneyMeterAnimation: true,
    performanceBadges: true,
    guidedTour: true,
    autoProgress: false,
    tooltips: true,
  },
  
  data: {
    organizationId: 'demo-org-acme',
    organizationName: 'Acme Corporation',
    sampleFile: '/demo-data/survey-1200-cols.csv',
    totalSavings: 2346892,
    employeeCount: 1245,
    memberCount: 2890,
    refreshInterval: null, // No auto-refresh in demo
    useLiveCalculations: true,
    mockNetworkDelay: 0, // No artificial delays
  },
  
  presentation: {
    animationSpeed: 'normal',
    highlightDelay: 500,
    autoPlayDelay: 3000,
    showPerformanceMetrics: true,
    showCalculationFormulas: true,
    enableKeyboardShortcuts: true,
    watermarkText: null, // No watermark for cleaner demos
  },
  
  analytics: {
    trackInteractions: true,
    trackTiming: true,
    reportingEndpoint: process.env.NEXT_PUBLIC_DEMO_ANALYTICS_ENDPOINT || null,
    sessionId: null, // Generated at runtime
  },
};

// Demo keyboard shortcuts
export const DEMO_SHORTCUTS = {
  'Ctrl+D': 'Toggle demo mode',
  'Ctrl+G': 'Start guided tour',
  'Ctrl+R': 'Reset demo data',
  'Ctrl+1-6': 'Jump to demo step',
  'Space': 'Pause/resume auto-play',
  'Escape': 'Exit demo mode',
  'F': 'Toggle fullscreen',
  'P': 'Toggle performance badges',
  'H': 'Toggle highlights',
  'T': 'Toggle tooltips',
};

// Demo step definitions
export const DEMO_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Assured Partners',
    target: '.logo',
    content: 'Transform your survey data into actionable insights',
    position: 'bottom',
    highlight: true,
    duration: 3000,
  },
  {
    id: 'filter',
    title: 'Smart Filtering',
    target: '.filter-bar',
    content: 'Filter by organization, period, or peer cohorts',
    position: 'bottom',
    highlight: true,
    action: () => {
      // Auto-select demo organization
      const select = document.querySelector('select[name="organization"]') as HTMLSelectElement;
      if (select) select.value = 'demo-org-acme';
    },
  },
  {
    id: 'money-meter',
    title: 'Total Savings Opportunity',
    target: '.money-meter',
    content: 'See your total savings potential at a glance',
    position: 'left',
    highlight: true,
    waitForAnimation: true,
  },
  {
    id: 'what-if',
    title: 'What-If Modeling',
    target: '.what-if-panel',
    content: 'Adjust variables to see real-time impact',
    position: 'left',
    highlight: true,
    action: () => {
      // Auto-adjust slider for effect
      const slider = document.querySelector('input[name="employeeCount"]') as HTMLInputElement;
      if (slider) {
        slider.value = '2.5';
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
    },
  },
  {
    id: 'waterfall',
    title: 'Variance Breakdown',
    target: '.variance-chart',
    content: 'Understand where savings come from',
    position: 'top',
    highlight: true,
  },
  {
    id: 'grid',
    title: 'Detailed Data Grid',
    target: '.reporting-grid',
    content: 'Drill down into specific metrics',
    position: 'top',
    highlight: true,
    action: () => {
      // Auto-expand first row
      const expandBtn = document.querySelector('.expand-button') as HTMLButtonElement;
      if (expandBtn) expandBtn.click();
    },
  },
  {
    id: 'export',
    title: 'Export & Share',
    target: '.export-button',
    content: 'Generate reports in multiple formats',
    position: 'left',
    highlight: true,
  },
];

// Sample data for demo mode
export const DEMO_SAMPLE_DATA = {
  organizations: [
    {
      id: 'demo-org-acme',
      name: 'Acme Corporation',
      size: 'large',
      industry: 'Manufacturing',
      employeeCount: 1245,
      memberCount: 2890,
    },
    {
      id: 'demo-org-beta',
      name: 'Beta Industries',
      size: 'medium',
      industry: 'Healthcare',
      employeeCount: 523,
      memberCount: 1205,
    },
    {
      id: 'demo-org-gamma',
      name: 'Gamma Tech',
      size: 'small',
      industry: 'Technology',
      employeeCount: 156,
      memberCount: 312,
    },
  ],
  
  monthlyData: [
    {
      period: '2025-01',
      organization: 'demo-org-acme',
      totalClaims: 245000,
      pepmActual: 208.33,
      pepmTarget: 195.00,
      variance: 13.33,
      variancePercent: 6.84,
    },
    // ... more monthly data
  ],
  
  peerComparison: [
    { name: 'Similar Size Co', similarity: 94, pepm: 201.50 },
    { name: 'Industry Peer A', similarity: 89, pepm: 198.75 },
    { name: 'Regional Competitor', similarity: 86, pepm: 205.00 },
    { name: 'Best Practice Leader', similarity: 82, pepm: 185.50 },
    { name: 'Benchmark Corp', similarity: 78, pepm: 192.25 },
  ],
};

// Demo mode hooks
export const useDemoMode = () => {
  const [config, setConfig] = useState<DemoConfig>(DEFAULT_DEMO_CONFIG);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  const startDemo = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(true);
    trackDemoEvent('demo_started');
  }, []);
  
  const stopDemo = useCallback(() => {
    setCurrentStep(-1);
    setIsPlaying(false);
    trackDemoEvent('demo_stopped');
  }, []);
  
  const nextStep = useCallback(() => {
    if (currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      trackDemoEvent('demo_step_advanced', { step: currentStep + 1 });
    } else {
      stopDemo();
    }
  }, [currentStep, stopDemo]);
  
  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      trackDemoEvent('demo_step_back', { step: currentStep - 1 });
    }
  }, [currentStep]);
  
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < DEMO_STEPS.length) {
      setCurrentStep(step);
      trackDemoEvent('demo_step_jumped', { step });
    }
  }, []);
  
  // Auto-advance logic
  useEffect(() => {
    if (!isPlaying || currentStep === -1) return;
    
    const step = DEMO_STEPS[currentStep];
    const timer = setTimeout(() => {
      nextStep();
    }, step.duration || config.presentation.autoPlayDelay);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, nextStep, config.presentation.autoPlayDelay]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!config.presentation.enableKeyboardShortcuts) return;
      
      if (e.key === 'Escape') {
        stopDemo();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key >= '1' && e.key <= '6' && e.ctrlKey) {
        e.preventDefault();
        goToStep(parseInt(e.key) - 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [config.presentation.enableKeyboardShortcuts, stopDemo, goToStep]);
  
  return {
    config,
    currentStep,
    isPlaying,
    startDemo,
    stopDemo,
    nextStep,
    previousStep,
    goToStep,
    currentStepData: DEMO_STEPS[currentStep] || null,
  };
};

// Demo analytics tracking
const trackDemoEvent = (event: string, data?: any) => {
  if (!DEFAULT_DEMO_CONFIG.analytics.trackInteractions) return;
  
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    sessionId: DEFAULT_DEMO_CONFIG.analytics.sessionId,
    ...data,
  };
  
  // Send to analytics endpoint if configured
  if (DEFAULT_DEMO_CONFIG.analytics.reportingEndpoint) {
    fetch(DEFAULT_DEMO_CONFIG.analytics.reportingEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(console.error);
  }
  
  // Also log to console in demo mode
  if (isDemoMode()) {
    console.log('📊 Demo Event:', payload);
  }
};

// Demo data generator for testing
export const generateDemoData = (months: number = 12) => {
  const data = [];
  const baseDate = new Date('2024-01-01');
  
  for (let i = 0; i < months; i++) {
    const date = new Date(baseDate);
    date.setMonth(date.getMonth() + i);
    
    data.push({
      period: date.toISOString().slice(0, 7),
      totalClaims: 200000 + Math.random() * 100000,
      pepmActual: 190 + Math.random() * 30,
      pepmTarget: 195,
      employeeCount: 1200 + Math.floor(Math.random() * 100),
      memberCount: 2800 + Math.floor(Math.random() * 200),
    });
  }
  
  return data;
};

// Export for use in components
export default {
  isDemoMode,
  DEFAULT_DEMO_CONFIG,
  DEMO_SHORTCUTS,
  DEMO_STEPS,
  DEMO_SAMPLE_DATA,
  useDemoMode,
  generateDemoData,
  trackDemoEvent,
};