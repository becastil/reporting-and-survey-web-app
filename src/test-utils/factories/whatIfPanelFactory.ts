/**
 * Test Data Factory for WhatIf Panel Component
 * Provides consistent, reusable test data scenarios
 */

import { WhatIfScenario } from '@/components/dashboard/WhatIfPanel';

export class WhatIfPanelFactory {
  /**
   * Default scenario with typical values
   */
  static default(): WhatIfScenario {
    return {
      employeeCount: 1000,
      employeeAdjustment: 0,
      pepmActual: 50000, // $500.00 PEPM
      pepmTarget: 45000, // $450.00 PEPM
      totalSavings: 600000 // $600K annual
    };
  }

  /**
   * Scenario with positive adjustment
   */
  static withPositiveAdjustment(): WhatIfScenario {
    return {
      ...this.default(),
      employeeAdjustment: 2.5
    };
  }

  /**
   * Scenario with negative adjustment
   */
  static withNegativeAdjustment(): WhatIfScenario {
    return {
      ...this.default(),
      employeeAdjustment: -3.0
    };
  }

  /**
   * Maximum adjustment scenarios
   */
  static edge = {
    maxPositive: (): WhatIfScenario => ({
      ...this.default(),
      employeeAdjustment: 5
    }),
    
    maxNegative: (): WhatIfScenario => ({
      ...this.default(),
      employeeAdjustment: -5
    }),
    
    zeroEmployees: (): WhatIfScenario => ({
      employeeCount: 0,
      employeeAdjustment: 0,
      pepmActual: 0,
      pepmTarget: 0,
      totalSavings: 0
    }),
    
    largeCompany: (): WhatIfScenario => ({
      employeeCount: 50000,
      employeeAdjustment: 0,
      pepmActual: 48000,
      pepmTarget: 44000,
      totalSavings: 2400000 // $2.4M
    }),
    
    smallCompany: (): WhatIfScenario => ({
      employeeCount: 50,
      employeeAdjustment: 0,
      pepmActual: 55000,
      pepmTarget: 50000,
      totalSavings: 30000
    })
  };

  /**
   * Performance scenarios
   */
  static performance = {
    highSavings: (): WhatIfScenario => ({
      employeeCount: 5000,
      employeeAdjustment: 0,
      pepmActual: 60000,
      pepmTarget: 40000,
      totalSavings: 12000000 // $12M
    }),
    
    negativeSavings: (): WhatIfScenario => ({
      employeeCount: 1000,
      employeeAdjustment: 0,
      pepmActual: 40000,
      pepmTarget: 50000,
      totalSavings: -1200000 // -$1.2M (over budget)
    }),
    
    breakEven: (): WhatIfScenario => ({
      employeeCount: 1000,
      employeeAdjustment: 0,
      pepmActual: 45000,
      pepmTarget: 45000,
      totalSavings: 0
    })
  };

  /**
   * Slider interaction scenarios
   */
  static sliderStates = {
    quarterPercent: (): WhatIfScenario => ({
      ...this.default(),
      employeeAdjustment: 0.25
    }),
    
    halfPercent: (): WhatIfScenario => ({
      ...this.default(),
      employeeAdjustment: 0.5
    }),
    
    onePercent: (): WhatIfScenario => ({
      ...this.default(),
      employeeAdjustment: 1.0
    }),
    
    twoPointFive: (): WhatIfScenario => ({
      ...this.default(),
      employeeAdjustment: 2.5
    }),
    
    incrementalSteps: (): WhatIfScenario[] => {
      return [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(value => ({
        ...this.default(),
        employeeAdjustment: value
      }));
    }
  };

  /**
   * Build custom scenario
   */
  static build(overrides: Partial<WhatIfScenario> = {}): WhatIfScenario {
    return {
      ...this.default(),
      ...overrides
    };
  }

  /**
   * Generate random realistic scenario
   */
  static random(): WhatIfScenario {
    const employeeCount = Math.floor(Math.random() * 5000) + 100;
    const pepmActual = Math.floor(Math.random() * 20000) + 40000;
    const pepmTarget = pepmActual - Math.floor(Math.random() * 10000);
    const totalSavings = (pepmTarget - pepmActual) * employeeCount * 12;
    const employeeAdjustment = Math.round((Math.random() * 10 - 5) * 10) / 10;
    
    return {
      employeeCount,
      employeeAdjustment,
      pepmActual,
      pepmTarget,
      totalSavings
    };
  }

  /**
   * Batch generation for stress testing
   */
  static batch(count: number): WhatIfScenario[] {
    return Array.from({ length: count }, () => this.random());
  }
}