/**
 * Example Test File
 * This demonstrates the testing patterns for the platform
 */

import { calculatePEPM, calculateVariance } from '@/lib/calculations';

describe('Calculation Engine', () => {
  describe('calculatePEPM', () => {
    it('calculates PEPM correctly with standard inputs', () => {
      const result = calculatePEPM({
        totalClaims: 2500000,
        memberMonths: 12000,
        adminFees: 50000,
        stopLossRecovery: 100000,
      });

      expect(result).toEqual({
        pepmActual: 208.33,
        breakdown: {
          medical: 150.00,
          rx: 45.00,
          admin: 4.17,
          stopLoss: -8.33,
        },
        formula: '(2500000 + 50000 - 100000) / 12000',
      });
    });

    it('handles edge case with zero member months', () => {
      const result = calculatePEPM({
        totalClaims: 1000000,
        memberMonths: 0,
        adminFees: 0,
        stopLossRecovery: 0,
      });

      expect(result.pepmActual).toBe(0);
      expect(result.error).toBe('Cannot calculate PEPM with zero member months');
    });

    it('validates negative claims amount', () => {
      expect(() => 
        calculatePEPM({
          totalClaims: -1000,
          memberMonths: 100,
          adminFees: 0,
          stopLossRecovery: 0,
        })
      ).toThrow('Total claims cannot be negative');
    });

    it('performs calculation in under 50ms', () => {
      const start = performance.now();
      
      calculatePEPM({
        totalClaims: 5000000,
        memberMonths: 25000,
        adminFees: 100000,
        stopLossRecovery: 200000,
      });
      
      const end = performance.now();
      expect(end - start).toBeLessThan(50);
    });
  });

  describe('calculateVariance', () => {
    it('calculates positive variance correctly', () => {
      const result = calculateVariance({
        actual: 220.50,
        target: 200.00,
      });

      expect(result).toEqual({
        variance: 20.50,
        variancePercent: 10.25,
        direction: 'unfavorable',
      });
    });

    it('calculates negative variance correctly', () => {
      const result = calculateVariance({
        actual: 180.00,
        target: 200.00,
      });

      expect(result).toEqual({
        variance: -20.00,
        variancePercent: -10.00,
        direction: 'favorable',
      });
    });

    it('handles zero target gracefully', () => {
      const result = calculateVariance({
        actual: 100.00,
        target: 0,
      });

      expect(result).toEqual({
        variance: 100.00,
        variancePercent: Infinity,
        direction: 'unfavorable',
        warning: 'Target is zero',
      });
    });
  });
});

describe('What-If Modeling', () => {
  it('adjusts for rebate timing shift', () => {
    const baseData = {
      pepm: 200.00,
      rebates: {
        q1: 50000,
        q2: 60000,
        q3: 55000,
        q4: 0,
      },
      memberMonths: 12000,
    };

    const adjusted = applyRebateTiming(baseData, 1); // Shift by 1 month

    expect(adjusted.rebates).toEqual({
      q1: 0,
      q2: 50000,
      q3: 60000,
      q4: 55000,
    });

    expect(adjusted.impact).toBeCloseTo(-13.75, 2); // PEPM impact
  });

  it('adjusts for employee count change', () => {
    const baseData = {
      pepm: 200.00,
      memberMonths: 12000,
      totalCost: 2400000,
    };

    const adjusted = applyEmployeeAdjustment(baseData, 2.5); // +2.5%

    expect(adjusted.memberMonths).toBe(12300);
    expect(adjusted.pepm).toBeCloseTo(195.12, 2);
    expect(adjusted.impact).toBeCloseTo(-4.88, 2);
  });
});

// Mock functions for demonstration
function applyRebateTiming(data: any, months: number) {
  // Implementation would go here
  return {
    rebates: {
      q1: 0,
      q2: 50000,
      q3: 60000,
      q4: 55000,
    },
    impact: -13.75,
  };
}

function applyEmployeeAdjustment(data: any, percent: number) {
  // Implementation would go here
  return {
    memberMonths: 12300,
    pepm: 195.12,
    impact: -4.88,
  };
}