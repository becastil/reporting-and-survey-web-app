/**
 * Unit Tests for WhatIfPanel Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WhatIfPanel } from '../WhatIfPanel';
import { WhatIfPanelFactory } from '@/test-utils/factories/whatIfPanelFactory';

describe('WhatIfPanel', () => {
  describe('Rendering', () => {
    it('renders panel with default scenario', () => {
      const scenario = WhatIfPanelFactory.default();
      render(<WhatIfPanel initialScenario={scenario} />);
      
      expect(screen.getByRole('region', { name: /what-if modeling panel/i })).toBeInTheDocument();
      expect(screen.getByText('What-If Modeling')).toBeInTheDocument();
      expect(screen.getByLabelText(/employee count adjustment/i)).toBeInTheDocument();
    });

    it('displays original values correctly', () => {
      const scenario = WhatIfPanelFactory.default();
      render(<WhatIfPanel initialScenario={scenario} />);
      
      expect(screen.getByText('1,000')).toBeInTheDocument(); // Employee count
      expect(screen.getByText('$500.00')).toBeInTheDocument(); // PEPM
      expect(screen.getByText('$600K')).toBeInTheDocument(); // Savings
    });

    it('shows performance badge when enabled', () => {
      const scenario = WhatIfPanelFactory.default();
      render(<WhatIfPanel initialScenario={scenario} showPerformanceBadge />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent(/\d+ms/);
    });

    it('renders slider with correct range', () => {
      const scenario = WhatIfPanelFactory.default();
      render(<WhatIfPanel initialScenario={scenario} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '-5');
      expect(slider).toHaveAttribute('max', '5');
      expect(slider).toHaveAttribute('step', '0.1');
    });
  });

  describe('Slider Interactions', () => {
    it('updates values when slider moves', async () => {
      const scenario = WhatIfPanelFactory.default();
      const onScenarioChange = jest.fn();
      
      render(
        <WhatIfPanel 
          initialScenario={scenario} 
          onScenarioChange={onScenarioChange}
        />
      );
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '2.5' } });
      
      await waitFor(() => {
        expect(screen.getByText('+2.5%')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(onScenarioChange).toHaveBeenCalledWith(
          expect.objectContaining({
            employeeAdjustment: 2.5
          })
        );
      }, { timeout: 500 });
    });

    it('shows adjusted employee count', async () => {
      const scenario = WhatIfPanelFactory.default();
      render(<WhatIfPanel initialScenario={scenario} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '5' } });
      
      await waitFor(() => {
        expect(screen.getByText('1,050')).toBeInTheDocument(); // 5% increase
        expect(screen.getByText('(+50)')).toBeInTheDocument(); // Delta
      });
    });

    it('handles negative adjustments', async () => {
      const scenario = WhatIfPanelFactory.default();
      render(<WhatIfPanel initialScenario={scenario} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '-3' } });
      
      await waitFor(() => {
        expect(screen.getByText('-3%')).toBeInTheDocument();
        expect(screen.getByText('970')).toBeInTheDocument(); // 3% decrease
        expect(screen.getByText('(-30)')).toBeInTheDocument();
      });
    });

    it('highlights active tick marks', async () => {
      const scenario = WhatIfPanelFactory.default();
      const { container } = render(<WhatIfPanel initialScenario={scenario} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '2.5' } });
      
      await waitFor(() => {
        const activeTick = container.querySelector('.activeTick');
        expect(activeTick).toBeInTheDocument();
      });
    });
  });

  describe('Calculations', () => {
    it('recalculates PEPM based on employee changes', async () => {
      const scenario = WhatIfPanelFactory.default();
      render(<WhatIfPanel initialScenario={scenario} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '5' } });
      
      await waitFor(() => {
        // PEPM should adjust when employee count changes
        const adjustedValues = screen.getAllByText(/\$476\.19/); // Approximate
        expect(adjustedValues.length).toBeGreaterThan(0);
      });
    });

    it('shows positive impact for favorable adjustments', async () => {
      const scenario = WhatIfPanelFactory.performance.highSavings();
      render(<WhatIfPanel initialScenario={scenario} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '-2' } });
      
      await waitFor(() => {
        expect(screen.getByText(/additional savings/i)).toBeInTheDocument();
      });
    });

    it('shows negative impact for unfavorable adjustments', async () => {
      const scenario = WhatIfPanelFactory.default();
      render(<WhatIfPanel initialScenario={scenario} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '3' } });
      
      await waitFor(() => {
        expect(screen.getByText(/reduced savings/i)).toBeInTheDocument();
      });
    });

    it('handles zero employees edge case', () => {
      const scenario = WhatIfPanelFactory.edge.zeroEmployees();
      render(<WhatIfPanel initialScenario={scenario} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('applies scenario when Apply button clicked', async () => {
      const scenario = WhatIfPanelFactory.default();
      const onApply = jest.fn();
      
      render(<WhatIfPanel initialScenario={scenario} onApply={onApply} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '2' } });
      
      await waitFor(() => {
        const applyButton = screen.getByRole('button', { name: /apply scenario/i });
        fireEvent.click(applyButton);
      });
      
      expect(onApply).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeCount: 1020,
          employeeAdjustment: 0 // Reset after apply
        })
      );
    });

    it('resets to original values', async () => {
      const scenario = WhatIfPanelFactory.default();
      const onReset = jest.fn();
      
      render(<WhatIfPanel initialScenario={scenario} onReset={onReset} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '3' } });
      
      await waitFor(() => {
        const resetButton = screen.getByRole('button', { name: /reset/i });
        fireEvent.click(resetButton);
      });
      
      expect(onReset).toHaveBeenCalled();
      expect(slider).toHaveValue('0');
    });

    it('disables buttons when no adjustment', () => {
      const scenario = WhatIfPanelFactory.default();
      render(<WhatIfPanel initialScenario={scenario} />);
      
      const applyButton = screen.getByRole('button', { name: /apply scenario/i });
      const resetButton = screen.getByRole('button', { name: /reset/i });
      
      expect(applyButton).toBeDisabled();
      expect(resetButton).toBeDisabled();
    });

    it('enables buttons when adjustment made', async () => {
      const scenario = WhatIfPanelFactory.default();
      render(<WhatIfPanel initialScenario={scenario} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '1' } });
      
      await waitFor(() => {
        const applyButton = screen.getByRole('button', { name: /apply scenario/i });
        const resetButton = screen.getByRole('button', { name: /reset/i });
        
        expect(applyButton).not.toBeDisabled();
        expect(resetButton).not.toBeDisabled();
      });
    });
  });

  describe('Performance', () => {
    it('debounces rapid slider changes', async () => {
      const scenario = WhatIfPanelFactory.default();
      const onScenarioChange = jest.fn();
      
      render(
        <WhatIfPanel 
          initialScenario={scenario} 
          onScenarioChange={onScenarioChange}
        />
      );
      
      const slider = screen.getByRole('slider');
      
      // Rapid changes
      for (let i = 1; i <= 5; i++) {
        fireEvent.change(slider, { target: { value: String(i) } });
      }
      
      // Should not call immediately for each change
      expect(onScenarioChange).toHaveBeenCalledTimes(0);
      
      // Wait for debounce
      await waitFor(() => {
        expect(onScenarioChange).toHaveBeenCalledTimes(1);
        expect(onScenarioChange).toHaveBeenCalledWith(
          expect.objectContaining({
            employeeAdjustment: 5
          })
        );
      }, { timeout: 500 });
    });

    it('shows calculating overlay during updates', async () => {
      const scenario = WhatIfPanelFactory.default();
      render(<WhatIfPanel initialScenario={scenario} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '2' } });
      
      expect(screen.getByText('Recalculating...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText('Recalculating...')).not.toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('maintains sub-50ms calculation time', async () => {
      const scenario = WhatIfPanelFactory.performance.highSavings();
      render(<WhatIfPanel initialScenario={scenario} showPerformanceBadge />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '3' } });
      
      await waitFor(() => {
        const badge = screen.getByRole('status');
        const time = parseInt(badge.textContent?.match(/(\d+)ms/)?.[1] || '0');
        expect(time).toBeLessThan(50);
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const scenario = WhatIfPanelFactory.default();
      render(<WhatIfPanel initialScenario={scenario} />);
      
      const panel = screen.getByRole('region');
      expect(panel).toHaveAttribute('aria-label', 'What-If Modeling Panel');
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label');
      expect(slider).toHaveAttribute('aria-valuemin', '-5');
      expect(slider).toHaveAttribute('aria-valuemax', '5');
      expect(slider).toHaveAttribute('aria-valuenow');
      expect(slider).toHaveAttribute('aria-valuetext');
    });

    it('supports keyboard navigation', async () => {
      const scenario = WhatIfPanelFactory.default();
      const user = userEvent.setup();
      
      render(<WhatIfPanel initialScenario={scenario} />);
      
      const slider = screen.getByRole('slider');
      slider.focus();
      
      await user.keyboard('{ArrowRight}');
      await waitFor(() => {
        expect(slider).toHaveValue('0.1');
      });
      
      await user.keyboard('{ArrowLeft}{ArrowLeft}');
      await waitFor(() => {
        expect(slider).toHaveValue('-0.1');
      });
    });

    it('announces live updates', async () => {
      const scenario = WhatIfPanelFactory.default();
      render(<WhatIfPanel initialScenario={scenario} showPerformanceBadge />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-live', 'polite');
      
      const calculatingOverlay = screen.queryByText('Recalculating...');
      if (calculatingOverlay) {
        expect(calculatingOverlay.parentElement).toHaveAttribute('aria-live', 'polite');
      }
    });
  });

  describe('Edge Cases', () => {
    it('handles large company scenarios', () => {
      const scenario = WhatIfPanelFactory.edge.largeCompany();
      render(<WhatIfPanel initialScenario={scenario} />);
      
      expect(screen.getByText('50,000')).toBeInTheDocument();
      expect(screen.getByText('$2.4M')).toBeInTheDocument();
    });

    it('handles small company scenarios', () => {
      const scenario = WhatIfPanelFactory.edge.smallCompany();
      render(<WhatIfPanel initialScenario={scenario} />);
      
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('$30K')).toBeInTheDocument();
    });

    it('handles negative savings scenarios', () => {
      const scenario = WhatIfPanelFactory.performance.negativeSavings();
      render(<WhatIfPanel initialScenario={scenario} />);
      
      // Should show negative savings appropriately
      const savingsElements = screen.getAllByText(/-?\$[\d.]+[KM]?/);
      expect(savingsElements.length).toBeGreaterThan(0);
    });

    it('handles break-even scenarios', () => {
      const scenario = WhatIfPanelFactory.performance.breakEven();
      render(<WhatIfPanel initialScenario={scenario} />);
      
      expect(screen.getAllByText('$0').length).toBeGreaterThan(0);
    });
  });
});