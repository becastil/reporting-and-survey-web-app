/**
 * What-If Modeling Panel Component
 * Interactive sliders for real-time financial calculations
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Calculator, RotateCcw } from 'lucide-react';
import styles from './WhatIfPanel.module.css';
import { formatCurrency, formatCompactCurrency } from '@/utils/formatCurrency';
import { withPerformanceTracking } from '@/utils/withPerformanceTracking';

export interface WhatIfScenario {
  employeeCount: number;
  employeeAdjustment: number; // -5 to +5 percentage
  pepmActual: number;
  pepmTarget: number;
  totalSavings: number;
}

export interface WhatIfPanelProps {
  initialScenario: WhatIfScenario;
  onScenarioChange?: (scenario: WhatIfScenario) => void;
  onApply?: (scenario: WhatIfScenario) => void;
  onReset?: () => void;
  showPerformanceBadge?: boolean;
  className?: string;
  testId?: string;
}

// Debounce function for performance
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

const WhatIfPanelComponent: React.FC<WhatIfPanelProps> = ({
  initialScenario,
  onScenarioChange,
  onApply,
  onReset,
  showPerformanceBadge = false,
  className = '',
  testId = 'what-if-panel',
}) => {
  const [scenario, setScenario] = useState<WhatIfScenario>(initialScenario);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculationTime, setLastCalculationTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const performanceRef = useRef<number>(Date.now());

  // Calculate adjusted values
  const adjustedValues = useMemo(() => {
    const startTime = Date.now();
    
    const adjustmentFactor = 1 + (scenario.employeeAdjustment / 100);
    const adjustedEmployeeCount = Math.round(scenario.employeeCount * adjustmentFactor);
    const employeeDelta = adjustedEmployeeCount - scenario.employeeCount;
    
    // Recalculate PEPM based on employee count change
    const totalCost = scenario.pepmActual * scenario.employeeCount;
    const adjustedPEPM = adjustedEmployeeCount > 0 
      ? totalCost / adjustedEmployeeCount 
      : scenario.pepmActual;
    
    // Calculate new savings opportunity
    const adjustedSavings = (scenario.pepmTarget - adjustedPEPM) * adjustedEmployeeCount * 12;
    const savingsDelta = adjustedSavings - scenario.totalSavings;
    
    const calculationTime = Date.now() - startTime;
    setLastCalculationTime(calculationTime);
    
    return {
      adjustedEmployeeCount,
      employeeDelta,
      adjustedPEPM,
      adjustedSavings,
      savingsDelta,
      calculationTime
    };
  }, [scenario]);

  // Debounced callback for scenario changes
  const debouncedOnScenarioChange = useMemo(
    () => debounce((newScenario: WhatIfScenario) => {
      setIsCalculating(false);
      onScenarioChange?.(newScenario);
    }, 150),
    [onScenarioChange]
  );

  // Handle slider change
  const handleSliderChange = useCallback((value: number) => {
    setIsCalculating(true);
    const newScenario = {
      ...scenario,
      employeeAdjustment: value
    };
    setScenario(newScenario);
    debouncedOnScenarioChange(newScenario);
  }, [scenario, debouncedOnScenarioChange]);

  // Handle slider interaction states
  const handleSliderMouseDown = () => setIsDragging(true);
  const handleSliderMouseUp = () => setIsDragging(false);

  // Handle apply button
  const handleApply = useCallback(() => {
    const finalScenario = {
      ...scenario,
      employeeCount: adjustedValues.adjustedEmployeeCount,
      pepmActual: adjustedValues.adjustedPEPM,
      totalSavings: adjustedValues.adjustedSavings,
      employeeAdjustment: 0 // Reset adjustment after applying
    };
    onApply?.(finalScenario);
    setScenario(finalScenario);
  }, [scenario, adjustedValues, onApply]);

  // Handle reset
  const handleReset = useCallback(() => {
    setScenario(initialScenario);
    onReset?.();
  }, [initialScenario, onReset]);

  // Format percentage with sign
  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value}%`;
  };

  // Get trend icon
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className={styles.trendUp} />;
    if (value < 0) return <TrendingDown className={styles.trendDown} />;
    return null;
  };

  return (
    <div 
      className={`${styles.panel} ${className}`}
      data-testid={testId}
      role="region"
      aria-label="What-If Modeling Panel"
    >
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Calculator className={styles.icon} />
          What-If Modeling
        </h3>
        {showPerformanceBadge && (
          <div 
            className={`${styles.performanceBadge} ${
              lastCalculationTime < 50 ? styles.performanceGood : styles.performanceSlow
            }`}
            role="status"
            aria-live="polite"
          >
            {lastCalculationTime}ms
          </div>
        )}
      </div>

      <div className={styles.sliderSection}>
        <div className={styles.sliderLabel}>
          <Users className={styles.labelIcon} />
          <span>Employee Count Adjustment</span>
          <span className={styles.sliderValue}>
            {formatPercentage(scenario.employeeAdjustment)}
          </span>
        </div>
        
        <div className={styles.sliderContainer}>
          <span className={styles.sliderMin}>-5%</span>
          <input
            type="range"
            className={`${styles.slider} ${isDragging ? styles.dragging : ''}`}
            min="-5"
            max="5"
            step="0.1"
            value={scenario.employeeAdjustment}
            onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
            onMouseDown={handleSliderMouseDown}
            onMouseUp={handleSliderMouseUp}
            onTouchStart={handleSliderMouseDown}
            onTouchEnd={handleSliderMouseUp}
            aria-label="Employee count adjustment percentage"
            aria-valuemin={-5}
            aria-valuemax={5}
            aria-valuenow={scenario.employeeAdjustment}
            aria-valuetext={formatPercentage(scenario.employeeAdjustment)}
          />
          <span className={styles.sliderMax}>+5%</span>
        </div>
        
        <div className={styles.sliderTicks}>
          {[-5, -2.5, 0, 2.5, 5].map(tick => (
            <div 
              key={tick}
              className={`${styles.tick} ${
                Math.abs(scenario.employeeAdjustment - tick) < 0.1 ? styles.activeTick : ''
              }`}
              style={{ left: `${((tick + 5) / 10) * 100}%` }}
            >
              <span className={styles.tickLabel}>{tick}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.comparisonSection}>
        <div className={styles.comparisonGrid}>
          <div className={styles.originalColumn}>
            <h4 className={styles.columnTitle}>Original</h4>
            
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Employees</span>
              <span className={styles.metricValue}>
                {scenario.employeeCount.toLocaleString()}
              </span>
            </div>
            
            <div className={styles.metric}>
              <span className={styles.metricLabel}>PEPM</span>
              <span className={styles.metricValue}>
                {formatCurrency(scenario.pepmActual)}
              </span>
            </div>
            
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Annual Savings</span>
              <span className={styles.metricValue}>
                {formatCompactCurrency(scenario.totalSavings)}
              </span>
            </div>
          </div>

          <div className={styles.arrowColumn}>
            <div className={styles.arrow}>→</div>
          </div>

          <div className={`${styles.adjustedColumn} ${isCalculating ? styles.calculating : ''}`}>
            <h4 className={styles.columnTitle}>Adjusted</h4>
            
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Employees</span>
              <span className={`${styles.metricValue} ${styles.highlight}`}>
                {adjustedValues.adjustedEmployeeCount.toLocaleString()}
                {adjustedValues.employeeDelta !== 0 && (
                  <span className={`${styles.delta} ${
                    adjustedValues.employeeDelta > 0 ? styles.positive : styles.negative
                  }`}>
                    ({adjustedValues.employeeDelta > 0 ? '+' : ''}{adjustedValues.employeeDelta})
                  </span>
                )}
              </span>
            </div>
            
            <div className={styles.metric}>
              <span className={styles.metricLabel}>PEPM</span>
              <span className={`${styles.metricValue} ${styles.highlight}`}>
                {formatCurrency(adjustedValues.adjustedPEPM)}
                {getTrendIcon(scenario.pepmActual - adjustedValues.adjustedPEPM)}
              </span>
            </div>
            
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Annual Savings</span>
              <span className={`${styles.metricValue} ${styles.highlight}`}>
                {formatCompactCurrency(adjustedValues.adjustedSavings)}
                {adjustedValues.savingsDelta !== 0 && (
                  <span className={`${styles.delta} ${
                    adjustedValues.savingsDelta > 0 ? styles.positive : styles.negative
                  }`}>
                    ({adjustedValues.savingsDelta > 0 ? '+' : ''}{formatCompactCurrency(adjustedValues.savingsDelta)})
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.impactSummary}>
        <DollarSign className={styles.impactIcon} />
        <span className={styles.impactText}>
          Potential Impact: 
          <strong className={`${adjustedValues.savingsDelta >= 0 ? styles.positive : styles.negative}`}>
            {' '}{formatCompactCurrency(Math.abs(adjustedValues.savingsDelta))}
          </strong>
          {' '}{adjustedValues.savingsDelta >= 0 ? 'additional savings' : 'reduced savings'}
        </span>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.resetButton}
          onClick={handleReset}
          disabled={scenario.employeeAdjustment === 0}
          aria-label="Reset to original values"
        >
          <RotateCcw className={styles.buttonIcon} />
          Reset
        </button>
        
        <button
          className={styles.applyButton}
          onClick={handleApply}
          disabled={scenario.employeeAdjustment === 0}
          aria-label="Apply adjusted values"
        >
          Apply Scenario
        </button>
      </div>

      {isCalculating && (
        <div className={styles.calculatingOverlay} aria-live="polite">
          Recalculating...
        </div>
      )}
    </div>
  );
};

export const WhatIfPanel = withPerformanceTracking(WhatIfPanelComponent, 'WhatIfPanel');