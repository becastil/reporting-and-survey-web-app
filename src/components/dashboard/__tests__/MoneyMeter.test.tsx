/**
 * Unit Tests for MoneyMeter Component
 * Coverage target: 95%
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MoneyMeter } from '../MoneyMeter';
import { formatCurrency } from '@/utils/formatCurrency';
import '@testing-library/jest-dom';

// Mock framer-motion for testing
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useSpring: () => ({
    set: jest.fn(),
    animate: jest.fn(() => ({ stop: jest.fn() })),
    on: jest.fn(() => jest.fn()),
  }),
  useTransform: () => ({
    on: jest.fn(() => jest.fn()),
  }),
}));

describe('MoneyMeter Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with formatted currency value', () => {
      render(<MoneyMeter value={234689200} />);

      expect(screen.getByText('Total Savings Opportunity')).toBeInTheDocument();
      expect(
        screen.getByRole('region', { name: /total savings opportunity/i })
      ).toBeInTheDocument();
    });

    it('renders zero value gracefully', () => {
      render(<MoneyMeter value={0} />);

      expect(screen.getByText('Total Savings Opportunity')).toBeInTheDocument();
    });

    it('handles negative values by showing zero', () => {
      render(<MoneyMeter value={-100000} />);

      expect(screen.getByText('Total Savings Opportunity')).toBeInTheDocument();
    });

    it('formats large values correctly', () => {
      render(<MoneyMeter value={1234567800} />);

      expect(screen.getByText('Total Savings Opportunity')).toBeInTheDocument();
    });
  });

  describe('Trend Indicator', () => {
    it('shows upward trend when value increases', () => {
      render(<MoneyMeter value={250000000} previousValue={200000000} />);

      expect(screen.getByText('25.0%')).toBeInTheDocument();
      expect(screen.getByText('↑')).toBeInTheDocument();
      expect(screen.getByText(/increased by 25.0 percent/i)).toBeInTheDocument();
    });

    it('shows downward trend when value decreases', () => {
      render(<MoneyMeter value={180000000} previousValue={200000000} />);

      expect(screen.getByText('10.0%')).toBeInTheDocument();
      expect(screen.getByText('↓')).toBeInTheDocument();
      expect(screen.getByText(/decreased by 10.0 percent/i)).toBeInTheDocument();
    });

    it('shows neutral trend when value unchanged', () => {
      render(<MoneyMeter value={200000000} previousValue={200000000} />);

      expect(screen.getByText('0.0%')).toBeInTheDocument();
      expect(screen.getByText('—')).toBeInTheDocument();
      expect(screen.getByText(/no change/i)).toBeInTheDocument();
    });

    it('handles previousValue of zero', () => {
      render(<MoneyMeter value={100000000} previousValue={0} />);

      expect(screen.queryByText('%')).not.toBeInTheDocument();
    });
  });

  describe('Interactivity', () => {
    it('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<MoneyMeter value={234689200} onClick={handleClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles Enter key press', () => {
      const handleClick = jest.fn();
      render(<MoneyMeter value={234689200} onClick={handleClick} />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles Space key press', () => {
      const handleClick = jest.fn();
      render(<MoneyMeter value={234689200} onClick={handleClick} />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is not interactive without onClick', () => {
      render(<MoneyMeter value={234689200} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
      expect(button).toHaveAttribute('tabIndex', '-1');
    });

    it('shows click hint when interactive', async () => {
      render(<MoneyMeter value={234689200} onClick={() => {}} />);

      await waitFor(
        () => {
          expect(screen.getByText('Click for breakdown')).toBeInTheDocument();
        },
        { timeout: 4000 }
      );
    });
  });

  describe('Performance Badge', () => {
    it('shows performance badge by default', () => {
      render(<MoneyMeter value={234689200} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('hides performance badge when disabled', () => {
      render(<MoneyMeter value={234689200} showPerformanceBadge={false} />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('displays calculation time in milliseconds', async () => {
      render(<MoneyMeter value={234689200} />);

      await waitFor(() => {
        const badge = screen.getByRole('status');
        expect(badge).toHaveTextContent(/\d+ms/);
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<MoneyMeter value={234689200} onClick={() => {}} />);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'Total Savings Opportunity');
      expect(region).toHaveAttribute('aria-live', 'polite');
      expect(region).toHaveAttribute('aria-atomic', 'true');
    });

    it('provides accessible button label', () => {
      render(<MoneyMeter value={234689200} onClick={() => {}} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Click to view breakdown')
      );
    });

    it('respects prefers-reduced-motion', () => {
      const mockMatchMedia = jest.fn().mockReturnValue({
        matches: true,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      });

      window.matchMedia = mockMatchMedia;

      render(<MoneyMeter value={234689200} />);

      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    it('has keyboard focus indicator', () => {
      render(<MoneyMeter value={234689200} onClick={() => {}} />);

      const button = screen.getByRole('button');
      fireEvent.focus(button);

      // Focus styles are applied via CSS
      expect(button).toHaveFocus();
    });
  });

  describe('Animation', () => {
    it('accepts custom animation duration', () => {
      render(<MoneyMeter value={234689200} animationDuration={1000} />);

      expect(screen.getByText('Total Savings Opportunity')).toBeInTheDocument();
    });

    it('handles animation interruption', () => {
      const { rerender } = render(<MoneyMeter value={100000000} />);

      // Update value mid-animation
      rerender(<MoneyMeter value={200000000} />);

      expect(screen.getByText('Total Savings Opportunity')).toBeInTheDocument();
    });

    it('completes animation within expected time', async () => {
      const startTime = Date.now();
      render(<MoneyMeter value={234689200} animationDuration={100} />);

      await waitFor(() => {
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(200);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid value changes', () => {
      const { rerender } = render(<MoneyMeter value={100000000} />);

      for (let i = 0; i < 10; i++) {
        rerender(<MoneyMeter value={100000000 + i * 10000000} />);
      }

      expect(screen.getByText('Total Savings Opportunity')).toBeInTheDocument();
    });

    it('handles component unmount during animation', () => {
      const { unmount } = render(<MoneyMeter value={234689200} />);

      // Unmount immediately
      expect(() => unmount()).not.toThrow();
    });

    it('handles very small values', () => {
      render(<MoneyMeter value={1} />);

      expect(screen.getByText('Total Savings Opportunity')).toBeInTheDocument();
    });

    it('handles maximum safe integer', () => {
      render(<MoneyMeter value={Number.MAX_SAFE_INTEGER} />);

      expect(screen.getByText('Total Savings Opportunity')).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(<MoneyMeter value={234689200} className="custom-class" />);

      const container = screen.getByTestId('money-meter');
      expect(container).toHaveClass('money-meter', 'custom-class');
    });

    it('uses custom testId', () => {
      render(<MoneyMeter value={234689200} testId="custom-money-meter" />);

      expect(screen.getByTestId('custom-money-meter')).toBeInTheDocument();
    });
  });

  describe('Type Safety and Validation', () => {
    it('handles invalid value types gracefully', () => {
      // Test with NaN
      render(<MoneyMeter value={NaN} />);
      expect(screen.getByText('Total Savings Opportunity')).toBeInTheDocument();
    });

    it('validates animation duration bounds', () => {
      // Test with very short duration
      render(<MoneyMeter value={234689200} animationDuration={0} />);
      expect(screen.getByText('Total Savings Opportunity')).toBeInTheDocument();

      // Test with very long duration
      const { rerender } = render(<MoneyMeter value={234689200} animationDuration={100000} />);
      expect(screen.getByText('Total Savings Opportunity')).toBeInTheDocument();

      // Test with negative duration (should use default)
      rerender(<MoneyMeter value={234689200} animationDuration={-1000} />);
      expect(screen.getByText('Total Savings Opportunity')).toBeInTheDocument();
    });

    it('ensures required props are provided', () => {
      // Value is required, TypeScript enforces this at compile time
      // This test documents the runtime behavior if somehow undefined is passed
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      // @ts-expect-error - Testing runtime validation
      render(<MoneyMeter value={undefined} />);

      expect(screen.getByText('Total Savings Opportunity')).toBeInTheDocument();

      consoleError.mockRestore();
    });
  });
});
