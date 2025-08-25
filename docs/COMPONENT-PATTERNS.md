# Component Pattern Library

## Document Purpose
This document provides implementation patterns, best practices, and code examples for all major components in the Assured Partners platform, ensuring consistency and maintainability.

## Core Component Patterns

### 1. Money Meter Component

#### Purpose
Hero metric display showing total savings opportunity with animated counter and performance badge.

#### Implementation
```tsx
// components/data-display/MoneyMeter.tsx
import { motion, useSpring, useTransform } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MoneyMeterProps {
  value: number;
  previousValue?: number;
  isLoading?: boolean;
  onClick?: () => void;
}

export function MoneyMeter({ 
  value, 
  previousValue = 0, 
  isLoading = false,
  onClick 
}: MoneyMeterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => 
    Math.floor(current).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  const trend = value > previousValue ? 'up' : value < previousValue ? 'down' : 'neutral';
  const trendPercent = previousValue ? ((value - previousValue) / previousValue * 100).toFixed(1) : 0;

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Performance Badge */}
      <motion.div
        className="absolute -top-2 -right-2 bg-status-success text-white px-2 py-1 rounded-full text-xs font-mono"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        42ms
      </motion.div>

      {/* Main Display */}
      <button
        onClick={onClick}
        className="group cursor-pointer"
        aria-label={`Savings opportunity: ${value}`}
      >
        <motion.div 
          className="text-7xl font-bold font-mono text-brand-primary"
          whileHover={{ scale: 1.02 }}
        >
          {isLoading ? (
            <div className="h-20 w-64 bg-gray-200 animate-pulse rounded" />
          ) : (
            <motion.span>{display}</motion.span>
          )}
        </motion.div>

        {/* Trend Indicator */}
        {trend !== 'neutral' && (
          <div className={`flex items-center gap-1 mt-2 ${
            trend === 'up' ? 'text-status-success' : 'text-status-error'
          }`}>
            {trend === 'up' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <span className="text-lg font-medium">{trendPercent}%</span>
          </div>
        )}

        <p className="text-gray-600 text-sm mt-1">
          Total Savings Opportunity
        </p>
      </button>
    </motion.div>
  );
}
```

#### Usage
```tsx
<MoneyMeter 
  value={2346892}
  previousValue={2100000}
  onClick={() => setShowCalculationModal(true)}
/>
```

---

### 2. What-If Slider Component

#### Purpose
Interactive sliders for real-time modeling of rebate timing and employee count adjustments.

#### Implementation
```tsx
// components/forms/WhatIfSlider.tsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface WhatIfSliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  onChange: (value: number) => void;
  formatDisplay?: (value: number) => string;
}

export function WhatIfSlider({
  label,
  min,
  max,
  step,
  defaultValue,
  unit,
  onChange,
  formatDisplay
}: WhatIfSliderProps) {
  const [value, setValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  
  const percentage = ((value - min) / (max - min)) * 100;
  const displayValue = formatDisplay ? formatDisplay(value) : `${value}${unit}`;

  useEffect(() => {
    onChange(value);
  }, [value, onChange]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <button
          onClick={() => setValue(defaultValue)}
          className="text-xs text-brand-secondary hover:underline"
        >
          Reset
        </button>
      </div>

      <div className="relative">
        {/* Track */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand-primary"
            style={{ width: `${percentage}%` }}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(parseFloat(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
        />

        {/* Thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-brand-primary rounded-full shadow-md pointer-events-none"
          style={{ left: `calc(${percentage}% - 10px)` }}
          animate={{ scale: isDragging ? 1.2 : 1 }}
        />
      </div>

      {/* Value Display */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">{min}{unit}</span>
        <motion.span 
          className="text-lg font-mono font-bold text-brand-primary"
          key={value}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {displayValue}
        </motion.span>
        <span className="text-xs text-gray-500">{max}{unit}</span>
      </div>

      {/* Impact Preview */}
      {value !== defaultValue && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pt-3 border-t"
        >
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Original</span>
            <span className="font-mono">{formatDisplay ? formatDisplay(defaultValue) : `${defaultValue}${unit}`}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-brand-primary">Adjusted</span>
            <span className="font-mono text-brand-primary">{displayValue}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
```

---

### 3. Interactive Reporting Grid

#### Purpose
Data table with virtual scrolling, sorting, filtering, and drill-down capabilities.

#### Implementation
```tsx
// components/data-display/ReportingGrid.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronDown, ChevronRight, ArrowUpDown } from 'lucide-react';
import { useState, useRef } from 'react';

interface GridColumn {
  key: string;
  label: string;
  type: 'currency' | 'percentage' | 'number' | 'text';
  sortable?: boolean;
  width?: number;
}

interface GridRow {
  id: string;
  data: Record<string, any>;
  children?: GridRow[];
}

interface ReportingGridProps {
  columns: GridColumn[];
  rows: GridRow[];
  isLoading?: boolean;
  focusMode?: boolean;
}

export function ReportingGrid({
  columns,
  rows,
  isLoading = false,
  focusMode = false
}: ReportingGridProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const parentRef = useRef<HTMLDivElement>(null);

  // Filter columns in focus mode
  const displayColumns = focusMode 
    ? columns.slice(0, 5) 
    : columns;

  // Virtual scrolling
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const toggleRow = (rowId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const formatCell = (value: any, type: GridColumn['type']) => {
    switch (type) {
      case 'currency':
        return value.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        });
      case 'percentage':
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
      case 'number':
        return value.toLocaleString();
      default:
        return value;
    }
  };

  if (isLoading) {
    return <SkeletonTable rows={10} columns={displayColumns.length} />;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b">
        <div className="flex">
          {displayColumns.map(column => (
            <button
              key={column.key}
              onClick={() => column.sortable && handleSort(column.key)}
              className={`
                flex items-center gap-2 px-4 py-3 text-left text-sm font-medium text-gray-700
                ${column.sortable ? 'hover:bg-gray-100 cursor-pointer' : ''}
                ${column.width ? `w-${column.width}` : 'flex-1'}
              `}
            >
              {column.label}
              {column.sortable && (
                <ArrowUpDown size={14} className="text-gray-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body with virtual scrolling */}
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const row = rows[virtualRow.index];
            const isExpanded = expandedRows.has(row.id);

            return (
              <div
                key={row.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {/* Main Row */}
                <div className="flex border-b hover:bg-gray-50">
                  {displayColumns.map((column, idx) => (
                    <div
                      key={column.key}
                      className={`
                        px-4 py-3 text-sm
                        ${column.width ? `w-${column.width}` : 'flex-1'}
                        ${idx === 0 && row.children ? 'flex items-center gap-2' : ''}
                      `}
                    >
                      {idx === 0 && row.children && (
                        <button
                          onClick={() => toggleRow(row.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      )}
                      <span className={
                        column.type === 'percentage' && row.data[column.key] > 0
                          ? 'text-status-error'
                          : column.type === 'percentage' && row.data[column.key] < 0
                          ? 'text-status-success'
                          : ''
                      }>
                        {formatCell(row.data[column.key], column.type)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Expanded Children */}
                {isExpanded && row.children && (
                  <div className="bg-gray-50 pl-8">
                    {row.children.map(child => (
                      <div key={child.id} className="flex border-b border-gray-200">
                        {displayColumns.map(column => (
                          <div
                            key={column.key}
                            className={`
                              px-4 py-2 text-sm text-gray-600
                              ${column.width ? `w-${column.width}` : 'flex-1'}
                            `}
                          >
                            {formatCell(child.data[column.key], column.type)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t px-4 py-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Showing {rows.length} rows</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
```

---

### 4. Unified Filter Bar

#### Purpose
Cross-module filtering that maintains state across Survey and Reporting views.

#### Implementation
```tsx
// components/forms/UnifiedFilterBar.tsx
import { X } from 'lucide-react';
import { Select } from '@/components/ui/select';

interface Filter {
  key: string;
  label: string;
  value: string | string[];
  options: { value: string; label: string }[];
}

interface UnifiedFilterBarProps {
  filters: Filter[];
  activeFilters: Record<string, string | string[]>;
  onChange: (filterKey: string, value: string | string[]) => void;
  onClear: () => void;
}

export function UnifiedFilterBar({
  filters,
  activeFilters,
  onChange,
  onClear
}: UnifiedFilterBarProps) {
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b">
      <div className="px-6 py-4 space-y-3">
        {/* Filter Controls */}
        <div className="flex gap-3 overflow-x-auto">
          {filters.map(filter => (
            <Select
              key={filter.key}
              value={activeFilters[filter.key] || ''}
              onValueChange={(value) => onChange(filter.key, value)}
            >
              <SelectTrigger className="min-w-[150px]">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All {filter.label}</SelectItem>
                {filter.options.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, value]) => {
              const filter = filters.find(f => f.key === key);
              const option = filter?.options.find(o => o.value === value);
              
              if (!option) return null;

              return (
                <div
                  key={key}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-brand-light text-brand-primary rounded-full text-sm"
                >
                  <span className="font-medium">{filter?.label}:</span>
                  <span>{option.label}</span>
                  <button
                    onClick={() => onChange(key, '')}
                    className="ml-1 hover:bg-brand-primary/10 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 5. Guided Demo Mode

#### Purpose
6-step interactive tour for stakeholder presentations.

#### Implementation
```tsx
// components/demo/GuidedDemo.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  placement: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 'filter',
    title: 'Start with Filters',
    description: 'Select your organization and time period to focus the analysis.',
    target: '.filter-bar',
    placement: 'bottom',
  },
  {
    id: 'meter',
    title: 'See Your Opportunity',
    description: 'The Money Meter shows your total addressable savings at a glance.',
    target: '.money-meter',
    placement: 'bottom',
  },
  {
    id: 'sliders',
    title: 'Model What-If Scenarios',
    description: 'Adjust rebate timing and employee count to see instant impact.',
    target: '.what-if-panel',
    placement: 'left',
  },
  {
    id: 'waterfall',
    title: 'Understand Variance',
    description: 'The waterfall chart breaks down what\'s driving your costs.',
    target: '.variance-chart',
    placement: 'top',
  },
  {
    id: 'grid',
    title: 'Dive into Details',
    description: 'Click any row to see line-item breakdowns.',
    target: '.reporting-grid',
    placement: 'top',
  },
  {
    id: 'export',
    title: 'Share Insights',
    description: 'Export your analysis in multiple formats for stakeholders.',
    target: '.export-button',
    placement: 'left',
  },
];

export function GuidedDemo({ 
  isActive, 
  onComplete 
}: { 
  isActive: boolean; 
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState<DOMRect | null>(null);

  const step = DEMO_STEPS[currentStep];

  useEffect(() => {
    if (!isActive || !step) return;

    const target = document.querySelector(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setHighlightPosition(rect);
      
      // Scroll into view
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActive, step]);

  const handleNext = () => {
    if (currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
      >
        {/* Backdrop with spotlight */}
        <div className="absolute inset-0 bg-black/50">
          {highlightPosition && (
            <motion.div
              className="absolute bg-transparent border-4 border-brand-secondary rounded-lg"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                top: highlightPosition.top - 8,
                left: highlightPosition.left - 8,
                width: highlightPosition.width + 16,
                height: highlightPosition.height + 16,
              }}
            />
          )}
        </div>

        {/* Tooltip */}
        <motion.div
          className="absolute bg-white rounded-lg shadow-xl p-6 max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            top: getTooltipPosition(highlightPosition, step.placement).top,
            left: getTooltipPosition(highlightPosition, step.placement).left,
          }}
        >
          {/* Progress */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-gray-500">
              Step {currentStep + 1} of {DEMO_STEPS.length}
            </span>
            <button
              onClick={onComplete}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
          <p className="text-gray-600 mb-4">{step.description}</p>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-dark"
            >
              {currentStep === DEMO_STEPS.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1 mt-4">
            {DEMO_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  idx === currentStep ? 'bg-brand-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function getTooltipPosition(
  targetRect: DOMRect | null,
  placement: DemoStep['placement']
) {
  if (!targetRect) return { top: '50%', left: '50%' };

  const offset = 20;
  
  switch (placement) {
    case 'top':
      return {
        top: targetRect.top - offset - 200,
        left: targetRect.left + targetRect.width / 2 - 175,
      };
    case 'bottom':
      return {
        top: targetRect.bottom + offset,
        left: targetRect.left + targetRect.width / 2 - 175,
      };
    case 'left':
      return {
        top: targetRect.top + targetRect.height / 2 - 100,
        left: targetRect.left - offset - 350,
      };
    case 'right':
      return {
        top: targetRect.top + targetRect.height / 2 - 100,
        left: targetRect.right + offset,
      };
  }
}
```

---

## Component Composition Guidelines

### Compound Components
```tsx
// Good: Compound component pattern
<DataCard>
  <DataCard.Header>
    <DataCard.Title>Monthly Variance</DataCard.Title>
    <DataCard.Actions>
      <Button size="sm">Export</Button>
    </DataCard.Actions>
  </DataCard.Header>
  <DataCard.Content>
    {/* content */}
  </DataCard.Content>
</DataCard>
```

### Render Props
```tsx
// For complex state sharing
<DataProvider
  render={({ data, isLoading, error }) => (
    <ReportingGrid 
      data={data}
      isLoading={isLoading}
      error={error}
    />
  )}
/>
```

### Custom Hooks
```tsx
// Encapsulate complex logic
function useWhatIfCalculation(baseValue: number) {
  const [adjustments, setAdjustments] = useState({
    rebateTiming: 0,
    employeeCount: 0,
  });

  const calculatedValue = useMemo(() => {
    // Complex calculation logic
    return baseValue * (1 + adjustments.employeeCount / 100);
  }, [baseValue, adjustments]);

  return {
    adjustments,
    setAdjustments,
    calculatedValue,
    reset: () => setAdjustments({ rebateTiming: 0, employeeCount: 0 }),
  };
}
```

---

## Performance Patterns

### Code Splitting
```tsx
// Lazy load heavy components
const VarianceChart = lazy(() => import('./components/charts/VarianceChart'));

// Use with Suspense
<Suspense fallback={<ChartSkeleton />}>
  <VarianceChart data={data} />
</Suspense>
```

### Memoization
```tsx
// Memo for expensive renders
const ExpensiveGrid = memo(ReportingGrid, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data && 
         prevProps.sortColumn === nextProps.sortColumn;
});

// useMemo for expensive calculations
const processedData = useMemo(() => 
  calculateVariances(rawData),
  [rawData]
);
```

### Virtual Scrolling
```tsx
// Use for large lists
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 48,
  overscan: 5,
});
```

---

**Document Owner:** Frontend Lead
**Last Updated:** January 2025
**Component Version:** 1.0.0