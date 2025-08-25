/**
 * Test Data Factory for Reporting Grid Component
 * Provides consistent, reusable test data scenarios
 */

import { GridRow } from '@/components/dashboard/ReportingGrid';

export class ReportingGridFactory {
  /**
   * Generate month string from index
   */
  private static getMonth(index: number): string {
    const months = [
      'January 2024', 'February 2024', 'March 2024', 'April 2024',
      'May 2024', 'June 2024', 'July 2024', 'August 2024',
      'September 2024', 'October 2024', 'November 2024', 'December 2024'
    ];
    return months[index % 12];
  }

  /**
   * Default grid data with 12 months
   */
  static default(): GridRow[] {
    return Array.from({ length: 12 }, (_, i) => ({
      id: `row-${i}`,
      month: this.getMonth(i),
      actualPEPM: 45000 + Math.random() * 10000,
      targetPEPM: 50000,
      variance: -5000 + Math.random() * 10000,
      lineItems: this.generateLineItems(i, 3)
    }));
  }

  /**
   * Generate line items for expandable rows
   */
  private static generateLineItems(parentIndex: number, count: number): GridRow[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `row-${parentIndex}-item-${i}`,
      month: `Line Item ${i + 1}`,
      actualPEPM: 10000 + Math.random() * 5000,
      targetPEPM: 12000,
      variance: -2000 + Math.random() * 4000
    }));
  }

  /**
   * Large dataset for virtual scrolling testing (480+ rows)
   */
  static large(): GridRow[] {
    const result: GridRow[] = [];
    
    // Generate 40 months of data (3+ years)
    for (let year = 2021; year <= 2024; year++) {
      for (let month = 0; month < 12; month++) {
        if (year === 2024 && month > 3) break; // Stop at April 2024
        
        const monthName = new Date(year, month).toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        });
        
        const baseRow: GridRow = {
          id: `row-${year}-${month}`,
          month: monthName,
          actualPEPM: 40000 + Math.random() * 20000,
          targetPEPM: 50000,
          variance: -10000 + Math.random() * 20000,
          lineItems: this.generateLineItems(month, 10) // 10 line items each
        };
        
        result.push(baseRow);
      }
    }
    
    return result;
  }

  /**
   * Small dataset for basic testing
   */
  static small(): GridRow[] {
    return [
      {
        id: 'row-1',
        month: 'January 2024',
        actualPEPM: 48000,
        targetPEPM: 50000,
        variance: -2000
      },
      {
        id: 'row-2',
        month: 'February 2024',
        actualPEPM: 52000,
        targetPEPM: 50000,
        variance: 2000
      },
      {
        id: 'row-3',
        month: 'March 2024',
        actualPEPM: 50000,
        targetPEPM: 50000,
        variance: 0
      }
    ];
  }

  /**
   * Edge cases for testing
   */
  static edge = {
    empty: (): GridRow[] => [],
    
    singleRow: (): GridRow[] => [{
      id: 'single',
      month: 'January 2024',
      actualPEPM: 50000,
      targetPEPM: 50000,
      variance: 0
    }],
    
    noLineItems: (): GridRow[] => {
      return Array.from({ length: 5 }, (_, i) => ({
        id: `row-${i}`,
        month: this.getMonth(i),
        actualPEPM: 45000 + Math.random() * 10000,
        targetPEPM: 50000,
        variance: -5000 + Math.random() * 10000
      }));
    },
    
    deepNesting: (): GridRow[] => {
      return [{
        id: 'root',
        month: 'Q1 2024',
        actualPEPM: 150000,
        targetPEPM: 150000,
        variance: 0,
        lineItems: [
          {
            id: 'jan',
            month: 'January',
            actualPEPM: 50000,
            targetPEPM: 50000,
            variance: 0,
            lineItems: [
              {
                id: 'jan-week1',
                month: 'Week 1',
                actualPEPM: 12500,
                targetPEPM: 12500,
                variance: 0
              },
              {
                id: 'jan-week2',
                month: 'Week 2',
                actualPEPM: 12500,
                targetPEPM: 12500,
                variance: 0
              }
            ]
          },
          {
            id: 'feb',
            month: 'February',
            actualPEPM: 50000,
            targetPEPM: 50000,
            variance: 0
          }
        ]
      }];
    },
    
    allPositive: (): GridRow[] => {
      return Array.from({ length: 5 }, (_, i) => ({
        id: `row-${i}`,
        month: this.getMonth(i),
        actualPEPM: 55000 + i * 1000,
        targetPEPM: 50000,
        variance: 5000 + i * 1000
      }));
    },
    
    allNegative: (): GridRow[] => {
      return Array.from({ length: 5 }, (_, i) => ({
        id: `row-${i}`,
        month: this.getMonth(i),
        actualPEPM: 45000 - i * 1000,
        targetPEPM: 50000,
        variance: -5000 - i * 1000
      }));
    }
  };

  /**
   * Performance testing scenarios
   */
  static performance = {
    stress: (): GridRow[] => {
      // Generate 1000 rows for stress testing
      return Array.from({ length: 1000 }, (_, i) => ({
        id: `stress-row-${i}`,
        month: `Row ${i + 1}`,
        actualPEPM: Math.random() * 100000,
        targetPEPM: 50000,
        variance: -50000 + Math.random() * 100000
      }));
    },
    
    withManyLineItems: (): GridRow[] => {
      // Generate rows with many line items
      return Array.from({ length: 10 }, (_, i) => ({
        id: `parent-${i}`,
        month: this.getMonth(i),
        actualPEPM: 450000,
        targetPEPM: 500000,
        variance: -50000,
        lineItems: Array.from({ length: 50 }, (_, j) => ({
          id: `parent-${i}-item-${j}`,
          month: `Line Item ${j + 1}`,
          actualPEPM: 9000,
          targetPEPM: 10000,
          variance: -1000
        }))
      }));
    }
  };

  /**
   * Build custom data
   */
  static build(count: number, options: Partial<GridRow> = {}): GridRow[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `custom-row-${i}`,
      month: this.getMonth(i),
      actualPEPM: 50000,
      targetPEPM: 50000,
      variance: 0,
      ...options
    }));
  }

  /**
   * Generate realistic trending data
   */
  static trending(trend: 'improving' | 'declining' | 'stable'): GridRow[] {
    const baseValue = 50000;
    const trendFactors = {
      improving: (i: number) => baseValue + i * 1000,
      declining: (i: number) => baseValue - i * 1000,
      stable: () => baseValue
    };
    
    const getTrend = trendFactors[trend];
    
    return Array.from({ length: 12 }, (_, i) => {
      const actual = getTrend(i);
      const target = baseValue;
      return {
        id: `trend-row-${i}`,
        month: this.getMonth(i),
        actualPEPM: actual,
        targetPEPM: target,
        variance: actual - target
      };
    });
  }
}