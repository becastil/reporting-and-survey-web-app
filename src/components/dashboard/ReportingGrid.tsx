/**
 * Interactive Reporting Grid Component
 * Virtual scrolling data grid with expandable rows and performance optimization
 */

'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ArrowUpDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './ReportingGrid.module.css';
import { formatCurrency } from '@/utils/formatCurrency';
import { withPerformanceTracking } from '@/utils/withPerformanceTracking';

export interface GridRow {
  id: string;
  month: string;
  actualPEPM: number;
  targetPEPM: number;
  variance: number;
  lineItems?: GridRow[];
  isExpanded?: boolean;
  level?: number;
}

export interface ReportingGridProps {
  data: GridRow[];
  viewMode?: 'focus' | 'advanced';
  onRowClick?: (row: GridRow) => void;
  onSortChange?: (column: string, direction: 'asc' | 'desc') => void;
  showPerformanceBadge?: boolean;
  className?: string;
  testId?: string;
}

type SortColumn = 'month' | 'actualPEPM' | 'targetPEPM' | 'variance';
type SortDirection = 'asc' | 'desc';

const ReportingGridComponent: React.FC<ReportingGridProps> = ({
  data = [],
  viewMode = 'focus',
  onRowClick,
  onSortChange,
  showPerformanceBadge = false,
  className = '',
  testId = 'reporting-grid',
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rowHeight = 48; // Fixed row height for virtual scrolling

  // Flatten data with expanded rows
  const flattenedData = useMemo(() => {
    const result: GridRow[] = [];
    
    const addRows = (rows: GridRow[], level = 0) => {
      rows.forEach(row => {
        result.push({ ...row, level });
        if (row.lineItems && expandedRows.has(row.id)) {
          addRows(row.lineItems, level + 1);
        }
      });
    };
    
    addRows(data);
    return result;
  }, [data, expandedRows]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return flattenedData;
    
    return [...flattenedData].sort((a, b) => {
      let aVal: any = a[sortColumn];
      let bVal: any = b[sortColumn];
      
      if (sortColumn === 'month') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [flattenedData, sortColumn, sortDirection]);

  // Virtual scrolling logic
  const totalHeight = sortedData.length * rowHeight;
  const visibleData = sortedData.slice(visibleRange.start, visibleRange.end);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const scrollTop = scrollContainerRef.current.scrollTop;
    const containerHeight = scrollContainerRef.current.clientHeight;
    
    const start = Math.floor(scrollTop / rowHeight);
    const visibleRows = Math.ceil(containerHeight / rowHeight);
    const end = Math.min(start + visibleRows + 5, sortedData.length); // Buffer of 5 rows
    
    setVisibleRange({ start: Math.max(0, start - 5), end }); // Buffer of 5 rows
  }, [sortedData.length]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial calculation
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  const toggleRowExpansion = (rowId: string) => {
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

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    
    if (onSortChange) {
      onSortChange(column, sortDirection === 'asc' ? 'desc' : 'asc');
    }
  };

  const calculatePercentDiff = (actual: number, target: number) => {
    if (target === 0) return 0;
    return ((actual - target) / target) * 100;
  };

  const getTrendIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className={styles.trendUp} />;
    if (variance < 0) return <TrendingDown className={styles.trendDown} />;
    return <Minus className={styles.trendNeutral} />;
  };

  return (
    <div 
      className={`${styles.gridContainer} ${className}`}
      data-testid={testId}
      role="table"
      aria-label="Financial Reporting Grid"
    >
      {showPerformanceBadge && (
        <div className={styles.performanceBadge} role="status">
          Rendering {visibleData.length} of {sortedData.length} rows
        </div>
      )}
      
      <div className={styles.viewToggle}>
        <button
          className={`${styles.toggleButton} ${viewMode === 'focus' ? styles.active : ''}`}
          onClick={() => {}}
          aria-pressed={viewMode === 'focus'}
        >
          Focus View
        </button>
        <button
          className={`${styles.toggleButton} ${viewMode === 'advanced' ? styles.active : ''}`}
          onClick={() => {}}
          aria-pressed={viewMode === 'advanced'}
        >
          Advanced View
        </button>
      </div>

      <div className={styles.gridHeader} role="row">
        <div 
          className={`${styles.headerCell} ${styles.monthColumn}`}
          role="columnheader"
          onClick={() => handleSort('month')}
          tabIndex={0}
          aria-sort={sortColumn === 'month' ? sortDirection : 'none'}
        >
          Month
          <ArrowUpDown className={styles.sortIcon} />
        </div>
        <div 
          className={`${styles.headerCell} ${styles.numberColumn}`}
          role="columnheader"
          onClick={() => handleSort('actualPEPM')}
          tabIndex={0}
          aria-sort={sortColumn === 'actualPEPM' ? sortDirection : 'none'}
        >
          PEPM Actual
          <ArrowUpDown className={styles.sortIcon} />
        </div>
        <div 
          className={`${styles.headerCell} ${styles.numberColumn}`}
          role="columnheader"
          onClick={() => handleSort('targetPEPM')}
          tabIndex={0}
          aria-sort={sortColumn === 'targetPEPM' ? sortDirection : 'none'}
        >
          Target PEPM
          <ArrowUpDown className={styles.sortIcon} />
        </div>
        <div 
          className={`${styles.headerCell} ${styles.percentColumn}`}
          role="columnheader"
        >
          % Diff
        </div>
        <div 
          className={`${styles.headerCell} ${styles.varianceColumn}`}
          role="columnheader"
          onClick={() => handleSort('variance')}
          tabIndex={0}
          aria-sort={sortColumn === 'variance' ? sortDirection : 'none'}
        >
          Variance ($)
          <ArrowUpDown className={styles.sortIcon} />
        </div>
      </div>

      <div 
        className={styles.gridBody}
        ref={scrollContainerRef}
        style={{ height: '600px', overflowY: 'auto' }}
        role="rowgroup"
      >
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          {visibleData.map((row, index) => {
            const percentDiff = calculatePercentDiff(row.actualPEPM, row.targetPEPM);
            const isExpanded = expandedRows.has(row.id);
            const hasLineItems = row.lineItems && row.lineItems.length > 0;
            const absoluteIndex = visibleRange.start + index;
            
            return (
              <div
                key={row.id}
                className={`${styles.gridRow} ${row.level ? styles[`level${row.level}`] : ''}`}
                style={{
                  position: 'absolute',
                  top: `${absoluteIndex * rowHeight}px`,
                  left: 0,
                  right: 0,
                  height: `${rowHeight}px`,
                  paddingLeft: row.level ? `${row.level * 24}px` : '0',
                }}
                role="row"
                onClick={() => onRowClick?.(row)}
                tabIndex={0}
                aria-expanded={hasLineItems ? isExpanded : undefined}
                aria-level={row.level || 1}
              >
                <div className={`${styles.cell} ${styles.monthColumn}`} role="cell">
                  {hasLineItems && (
                    <button
                      className={styles.expandButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRowExpansion(row.id);
                      }}
                      aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                    >
                      {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </button>
                  )}
                  {row.month}
                </div>
                <div className={`${styles.cell} ${styles.numberColumn}`} role="cell">
                  {formatCurrency(row.actualPEPM)}
                </div>
                <div className={`${styles.cell} ${styles.numberColumn}`} role="cell">
                  {formatCurrency(row.targetPEPM)}
                </div>
                <div 
                  className={`${styles.cell} ${styles.percentColumn} ${
                    percentDiff > 0 ? styles.positive : percentDiff < 0 ? styles.negative : ''
                  }`} 
                  role="cell"
                >
                  {percentDiff.toFixed(1)}%
                </div>
                <div 
                  className={`${styles.cell} ${styles.varianceColumn} ${
                    row.variance > 0 ? styles.positive : row.variance < 0 ? styles.negative : ''
                  }`} 
                  role="cell"
                >
                  <span className={styles.varianceValue}>
                    {getTrendIcon(row.variance)}
                    {formatCurrency(Math.abs(row.variance))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.gridFooter}>
        <div className={styles.summary}>
          <span>Total Rows: {sortedData.length}</span>
          {viewMode === 'advanced' && (
            <span className={styles.advancedInfo}>
              | Expanded: {expandedRows.size} | Visible: {visibleData.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const ReportingGrid = withPerformanceTracking(ReportingGridComponent, 'ReportingGrid');