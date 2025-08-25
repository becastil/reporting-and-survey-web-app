/**
 * Storybook Stories for MoneyMeter Component
 * Demonstrates all states and variations
 */

import type { Meta, StoryObj } from '@storybook/react';
import { MoneyMeter } from './MoneyMeter';
import { useState } from 'react';

const meta = {
  title: 'Dashboard/MoneyMeter',
  component: MoneyMeter,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays total savings opportunity with animated value and performance tracking.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 10000000, step: 10000 },
      description: 'Current savings value in cents',
    },
    previousValue: {
      control: { type: 'number', min: 0, max: 10000000, step: 10000 },
      description: 'Previous value for trend calculation',
    },
    animationDuration: {
      control: { type: 'number', min: 0, max: 5000, step: 100 },
      description: 'Animation duration in milliseconds',
    },
    showPerformanceBadge: {
      control: 'boolean',
      description: 'Show performance tracking badge',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback when meter is clicked',
    },
  },
} satisfies Meta<typeof MoneyMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state with standard animation
 */
export const Default: Story = {
  args: {
    value: 234689200, // $2,346,892 in cents
    showPerformanceBadge: true,
    onClick: () => console.log('Money Meter clicked'),
  },
};

/**
 * With trend indicator showing increase
 */
export const WithTrendUp: Story = {
  args: {
    value: 250000000, // $2,500,000
    previousValue: 200000000, // $2,000,000
    showPerformanceBadge: true,
    onClick: () => console.log('Money Meter clicked'),
  },
};

/**
 * With trend indicator showing decrease
 */
export const WithTrendDown: Story = {
  args: {
    value: 180000000, // $1,800,000
    previousValue: 200000000, // $2,000,000
    showPerformanceBadge: true,
    onClick: () => console.log('Money Meter clicked'),
  },
};

/**
 * No change in value
 */
export const NoChange: Story = {
  args: {
    value: 200000000, // $2,000,000
    previousValue: 200000000, // $2,000,000
    showPerformanceBadge: true,
  },
};

/**
 * Zero value state
 */
export const ZeroValue: Story = {
  args: {
    value: 0,
    showPerformanceBadge: true,
  },
};

/**
 * Very large value (>$10M)
 */
export const LargeValue: Story = {
  args: {
    value: 1523456700, // $15,234,567
    showPerformanceBadge: true,
    onClick: () => console.log('Money Meter clicked'),
  },
};

/**
 * Fast animation (1 second)
 */
export const FastAnimation: Story = {
  args: {
    value: 234689200,
    animationDuration: 1000,
    showPerformanceBadge: true,
  },
};

/**
 * Slow animation (5 seconds)
 */
export const SlowAnimation: Story = {
  args: {
    value: 234689200,
    animationDuration: 5000,
    showPerformanceBadge: true,
  },
};

/**
 * Without performance badge
 */
export const NoPerformanceBadge: Story = {
  args: {
    value: 234689200,
    showPerformanceBadge: false,
  },
};

/**
 * Non-interactive (no onClick)
 */
export const NonInteractive: Story = {
  args: {
    value: 234689200,
    showPerformanceBadge: true,
    // No onClick prop
  },
};

/**
 * Interactive example with state updates
 */
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(100000000); // $1,000,000
    const [previousValue, setPreviousValue] = useState(80000000); // $800,000

    const handleClick = () => {
      setPreviousValue(value);
      setValue(value + Math.floor(Math.random() * 50000000)); // Add random amount
    };

    const handleReset = () => {
      setValue(100000000);
      setPreviousValue(80000000);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: '400px' }}>
        <MoneyMeter
          value={value}
          previousValue={previousValue}
          showPerformanceBadge={true}
          onClick={handleClick}
        />
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={handleClick} style={{ padding: '0.5rem 1rem' }}>
            Update Value
          </button>
          <button onClick={handleReset} style={{ padding: '0.5rem 1rem' }}>
            Reset
          </button>
        </div>
      </div>
    );
  },
};

/**
 * Mobile viewport
 */
export const Mobile: Story = {
  args: {
    value: 234689200,
    showPerformanceBadge: true,
    onClick: () => console.log('Money Meter clicked'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Tablet viewport
 */
export const Tablet: Story = {
  args: {
    value: 234689200,
    showPerformanceBadge: true,
    onClick: () => console.log('Money Meter clicked'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

/**
 * High contrast mode simulation
 */
export const HighContrast: Story = {
  args: {
    value: 234689200,
    showPerformanceBadge: true,
    onClick: () => console.log('Money Meter clicked'),
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div style={{ filter: 'contrast(2)' }}>
        <Story />
      </div>
    ),
  ],
};
