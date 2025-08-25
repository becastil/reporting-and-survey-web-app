/**
 * Unit Tests for ReportingGrid Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportingGrid } from '../ReportingGrid';
import { ReportingGridFactory } from '@/test-utils/factories/reportingGridFactory';

describe('ReportingGrid', () => {
  describe('Rendering', () => {
    it('renders grid with basic data', () => {
      const data = ReportingGridFactory.small();
      render(<ReportingGrid data={data} />);
      
      expect(screen.getByRole('table', { name: /financial reporting grid/i })).toBeInTheDocument();
      expect(screen.getByText('January 2024')).toBeInTheDocument();
      expect(screen.getByText('February 2024')).toBeInTheDocument();
      expect(screen.getByText('March 2024')).toBeInTheDocument();
    });

    it('renders empty state', () => {
      render(<ReportingGrid data={[]} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Total Rows: 0')).toBeInTheDocument();
    });

    it('renders all required columns', () => {
      const data = ReportingGridFactory.small();
      render(<ReportingGrid data={data} />);
      
      expect(screen.getByRole('columnheader', { name: /month/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /pepm actual/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /target pepm/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /% diff/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /variance/i })).toBeInTheDocument();
    });

    it('formats currency values correctly', () => {
      const data = [{
        id: 'test-1',
        month: 'Test Month',
        actualPEPM: 1234567,
        targetPEPM: 1000000,
        variance: 234567
      }];
      
      render(<ReportingGrid data={data} />);
      
      expect(screen.getByText('$12,345.67')).toBeInTheDocument();
      expect(screen.getByText('$10,000.00')).toBeInTheDocument();
      expect(screen.getByText('$2,345.67')).toBeInTheDocument();
    });

    it('calculates percentage difference correctly', () => {
      const data = [{
        id: 'test-1',
        month: 'Test Month',
        actualPEPM: 55000,
        targetPEPM: 50000,
        variance: 5000
      }];
      
      render(<ReportingGrid data={data} />);
      
      expect(screen.getByText('10.0%')).toBeInTheDocument();
    });
  });

  describe('View Modes', () => {
    it('renders focus view by default', () => {
      const data = ReportingGridFactory.default();
      render(<ReportingGrid data={data} />);
      
      const focusButton = screen.getByRole('button', { name: /focus view/i });
      expect(focusButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('renders advanced view when specified', () => {
      const data = ReportingGridFactory.default();
      render(<ReportingGrid data={data} viewMode="advanced" />);
      
      const advancedButton = screen.getByRole('button', { name: /advanced view/i });
      expect(advancedButton).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText(/expanded:/i)).toBeInTheDocument();
    });

    it('shows performance badge when enabled', () => {
      const data = ReportingGridFactory.default();
      render(<ReportingGrid data={data} showPerformanceBadge />);
      
      expect(screen.getByRole('status')).toHaveTextContent(/rendering \d+ of \d+ rows/i);
    });
  });

  describe('Sorting', () => {
    it('sorts by month column', async () => {
      const data = ReportingGridFactory.small();
      const onSortChange = jest.fn();
      
      render(<ReportingGrid data={data} onSortChange={onSortChange} />);
      
      const monthHeader = screen.getByRole('columnheader', { name: /month/i });
      fireEvent.click(monthHeader);
      
      await waitFor(() => {
        expect(onSortChange).toHaveBeenCalledWith('month', 'asc');
      });
    });

    it('toggles sort direction on repeated clicks', async () => {
      const data = ReportingGridFactory.small();
      const onSortChange = jest.fn();
      
      render(<ReportingGrid data={data} onSortChange={onSortChange} />);
      
      const actualHeader = screen.getByRole('columnheader', { name: /pepm actual/i });
      
      fireEvent.click(actualHeader);
      await waitFor(() => {
        expect(onSortChange).toHaveBeenCalledWith('actualPEPM', 'asc');
      });
      
      fireEvent.click(actualHeader);
      await waitFor(() => {
        expect(onSortChange).toHaveBeenLastCalledWith('actualPEPM', 'desc');
      });
    });

    it('updates aria-sort attribute when sorting', () => {
      const data = ReportingGridFactory.small();
      render(<ReportingGrid data={data} />);
      
      const varianceHeader = screen.getByRole('columnheader', { name: /variance/i });
      
      expect(varianceHeader).toHaveAttribute('aria-sort', 'none');
      
      fireEvent.click(varianceHeader);
      
      expect(varianceHeader).toHaveAttribute('aria-sort', 'ascending');
    });
  });

  describe('Row Expansion', () => {
    it('expands rows with line items', async () => {
      const data = ReportingGridFactory.default();
      render(<ReportingGrid data={data} />);
      
      const expandButtons = screen.getAllByLabelText(/expand row/i);
      fireEvent.click(expandButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/collapse row/i)).toBeInTheDocument();
        expect(screen.getByText('Line Item 1')).toBeInTheDocument();
      });
    });

    it('collapses expanded rows', async () => {
      const data = ReportingGridFactory.default();
      render(<ReportingGrid data={data} />);
      
      const expandButton = screen.getAllByLabelText(/expand row/i)[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const collapseButton = screen.getByLabelText(/collapse row/i);
        fireEvent.click(collapseButton);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Line Item 1')).not.toBeInTheDocument();
      });
    });

    it('maintains expanded state during sorting', async () => {
      const data = ReportingGridFactory.default();
      render(<ReportingGrid data={data} />);
      
      // Expand first row
      const expandButton = screen.getAllByLabelText(/expand row/i)[0];
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        expect(screen.getByText('Line Item 1')).toBeInTheDocument();
      });
      
      // Sort by variance
      const varianceHeader = screen.getByRole('columnheader', { name: /variance/i });
      fireEvent.click(varianceHeader);
      
      // Line items should still be visible
      expect(screen.getByText('Line Item 1')).toBeInTheDocument();
    });
  });

  describe('Virtual Scrolling', () => {
    it('handles large datasets efficiently', () => {
      const data = ReportingGridFactory.large();
      const { container } = render(<ReportingGrid data={data} />);
      
      const gridBody = container.querySelector('.gridBody');
      expect(gridBody).toBeInTheDocument();
      
      // Check that not all rows are rendered initially
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeLessThan(data.length);
    });

    it('updates visible range on scroll', async () => {
      const data = ReportingGridFactory.large();
      const { container } = render(<ReportingGrid data={data} showPerformanceBadge />);
      
      const gridBody = container.querySelector('.gridBody');
      
      // Simulate scroll
      fireEvent.scroll(gridBody!, { target: { scrollTop: 500 } });
      
      await waitFor(() => {
        const badge = screen.getByRole('status');
        expect(badge).toHaveTextContent(/rendering \d+ of \d+ rows/i);
      });
    });
  });

  describe('Interactivity', () => {
    it('calls onRowClick when row is clicked', () => {
      const data = ReportingGridFactory.small();
      const onRowClick = jest.fn();
      
      render(<ReportingGrid data={data} onRowClick={onRowClick} />);
      
      const rows = screen.getAllByRole('row');
      fireEvent.click(rows[1]); // Click first data row (after header)
      
      expect(onRowClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'row-1',
          month: 'January 2024'
        })
      );
    });

    it('prevents row click when expanding', () => {
      const data = ReportingGridFactory.default();
      const onRowClick = jest.fn();
      
      render(<ReportingGrid data={data} onRowClick={onRowClick} />);
      
      const expandButton = screen.getAllByLabelText(/expand row/i)[0];
      fireEvent.click(expandButton);
      
      expect(onRowClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const data = ReportingGridFactory.small();
      render(<ReportingGrid data={data} />);
      
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Financial Reporting Grid');
      
      const rows = screen.getAllByRole('row');
      rows.forEach(row => {
        expect(row).toHaveAttribute('tabindex');
      });
    });

    it('supports keyboard navigation', async () => {
      const data = ReportingGridFactory.default();
      const user = userEvent.setup();
      
      render(<ReportingGrid data={data} />);
      
      const firstRow = screen.getAllByRole('row')[1];
      
      await user.tab();
      expect(firstRow).toHaveFocus();
      
      await user.keyboard('{Enter}');
      // Verify action was triggered
    });

    it('announces expanded state to screen readers', () => {
      const data = ReportingGridFactory.default();
      render(<ReportingGrid data={data} />);
      
      const rowsWithLineItems = screen.getAllByRole('row').filter(row =>
        row.getAttribute('aria-expanded') !== undefined
      );
      
      expect(rowsWithLineItems.length).toBeGreaterThan(0);
      expect(rowsWithLineItems[0]).toHaveAttribute('aria-expanded', 'false');
    });

    it('provides level information for nested rows', async () => {
      const data = ReportingGridFactory.edge.deepNesting();
      render(<ReportingGrid data={data} />);
      
      const expandButton = screen.getByLabelText(/expand row/i);
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        const nestedRows = screen.getAllByRole('row').filter(row =>
          row.getAttribute('aria-level') === '2'
        );
        expect(nestedRows.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Visual States', () => {
    it('applies positive styling to positive variance', () => {
      const data = ReportingGridFactory.edge.allPositive();
      const { container } = render(<ReportingGrid data={data} />);
      
      const positiveCells = container.querySelectorAll('.positive');
      expect(positiveCells.length).toBeGreaterThan(0);
    });

    it('applies negative styling to negative variance', () => {
      const data = ReportingGridFactory.edge.allNegative();
      const { container } = render(<ReportingGrid data={data} />);
      
      const negativeCells = container.querySelectorAll('.negative');
      expect(negativeCells.length).toBeGreaterThan(0);
    });

    it('shows trend icons based on variance', () => {
      const data = [
        { id: '1', month: 'Jan', actualPEPM: 55000, targetPEPM: 50000, variance: 5000 },
        { id: '2', month: 'Feb', actualPEPM: 45000, targetPEPM: 50000, variance: -5000 },
        { id: '3', month: 'Mar', actualPEPM: 50000, targetPEPM: 50000, variance: 0 }
      ];
      
      const { container } = render(<ReportingGrid data={data} />);
      
      expect(container.querySelector('.trendUp')).toBeInTheDocument();
      expect(container.querySelector('.trendDown')).toBeInTheDocument();
      expect(container.querySelector('.trendNeutral')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles rapid data updates', async () => {
      const { rerender } = render(<ReportingGrid data={ReportingGridFactory.small()} />);
      
      // Rapidly update data
      for (let i = 0; i < 10; i++) {
        rerender(<ReportingGrid data={ReportingGridFactory.build(3 + i)} />);
      }
      
      // Component should still be functional
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('maintains performance with stress test data', () => {
      const data = ReportingGridFactory.performance.stress();
      const { container } = render(<ReportingGrid data={data} showPerformanceBadge />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent(/rendering \d+ of 1000 rows/i);
      
      // Should only render visible rows
      const rows = container.querySelectorAll('.gridRow');
      expect(rows.length).toBeLessThan(100); // Much less than 1000
    });
  });
});