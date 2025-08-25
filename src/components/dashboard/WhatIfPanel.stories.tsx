/**
 * Storybook Stories for WhatIfPanel Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { WhatIfPanel } from './WhatIfPanel';
import { WhatIfPanelFactory } from '@/test-utils/factories/whatIfPanelFactory';

const meta = {
  title: 'Dashboard/WhatIfPanel',
  component: WhatIfPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Interactive What-If modeling panel with real-time calculations and performance optimization.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    showPerformanceBadge: {
      control: 'boolean',
      description: 'Show performance metrics badge'
    },
    onScenarioChange: { action: 'scenario-changed' },
    onApply: { action: 'scenario-applied' },
    onReset: { action: 'scenario-reset' }
  }
} satisfies Meta<typeof WhatIfPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default panel with typical scenario
 */
export const Default: Story = {
  args: {
    initialScenario: WhatIfPanelFactory.default()
  }
};

/**
 * Panel with performance badge
 */
export const WithPerformanceBadge: Story = {
  args: {
    initialScenario: WhatIfPanelFactory.default(),
    showPerformanceBadge: true
  }
};

/**
 * Positive adjustment scenario
 */
export const PositiveAdjustment: Story = {
  args: {
    initialScenario: WhatIfPanelFactory.withPositiveAdjustment()
  },
  parameters: {
    docs: {
      description: {
        story: 'Panel showing a 2.5% increase in employee count'
      }
    }
  }
};

/**
 * Negative adjustment scenario
 */
export const NegativeAdjustment: Story = {
  args: {
    initialScenario: WhatIfPanelFactory.withNegativeAdjustment()
  },
  parameters: {
    docs: {
      description: {
        story: 'Panel showing a 3% decrease in employee count'
      }
    }
  }
};

/**
 * Maximum positive adjustment
 */
export const MaxPositiveAdjustment: Story = {
  args: {
    initialScenario: WhatIfPanelFactory.edge.maxPositive()
  },
  parameters: {
    docs: {
      description: {
        story: 'Slider at maximum +5% adjustment'
      }
    }
  }
};

/**
 * Maximum negative adjustment
 */
export const MaxNegativeAdjustment: Story = {
  args: {
    initialScenario: WhatIfPanelFactory.edge.maxNegative()
  },
  parameters: {
    docs: {
      description: {
        story: 'Slider at maximum -5% adjustment'
      }
    }
  }
};

/**
 * Large company scenario
 */
export const LargeCompany: Story = {
  args: {
    initialScenario: WhatIfPanelFactory.edge.largeCompany(),
    showPerformanceBadge: true
  },
  parameters: {
    docs: {
      description: {
        story: '50,000 employees with $2.4M savings opportunity'
      }
    }
  }
};

/**
 * Small company scenario
 */
export const SmallCompany: Story = {
  args: {
    initialScenario: WhatIfPanelFactory.edge.smallCompany()
  },
  parameters: {
    docs: {
      description: {
        story: '50 employees with $30K savings opportunity'
      }
    }
  }
};

/**
 * High savings opportunity
 */
export const HighSavings: Story = {
  args: {
    initialScenario: WhatIfPanelFactory.performance.highSavings()
  },
  parameters: {
    docs: {
      description: {
        story: '$12M annual savings opportunity scenario'
      }
    }
  }
};

/**
 * Negative savings (over budget)
 */
export const NegativeSavings: Story = {
  args: {
    initialScenario: WhatIfPanelFactory.performance.negativeSavings()
  },
  parameters: {
    docs: {
      description: {
        story: 'Scenario where actual costs exceed target'
      }
    }
  }
};

/**
 * Break-even scenario
 */
export const BreakEven: Story = {
  args: {
    initialScenario: WhatIfPanelFactory.performance.breakEven()
  },
  parameters: {
    docs: {
      description: {
        story: 'Actual and target PEPM are equal'
      }
    }
  }
};

/**
 * Interactive example with all callbacks
 */
export const Interactive: Story = {
  args: {
    initialScenario: WhatIfPanelFactory.default(),
    showPerformanceBadge: true,
    onScenarioChange: (scenario) => {
      console.log('Scenario changed:', scenario);
    },
    onApply: (scenario) => {
      console.log('Applied scenario:', scenario);
      alert(`Applied: ${scenario.employeeCount} employees, ${scenario.totalSavings / 100} savings`);
    },
    onReset: () => {
      console.log('Reset to original');
      alert('Reset to original values');
    }
  }
};

/**
 * Mobile responsive view
 */
export const MobileView: Story = {
  args: {
    initialScenario: WhatIfPanelFactory.default()
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Panel optimized for mobile devices'
      }
    }
  }
};

/**
 * Dark mode variant
 */
export const DarkMode: Story = {
  args: {
    initialScenario: WhatIfPanelFactory.default(),
    showPerformanceBadge: true
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    },
    docs: {
      description: {
        story: 'Panel styled for dark mode theme'
      }
    }
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    )
  ]
};

/**
 * Incremental adjustments showcase
 */
export const IncrementalAdjustments: Story = {
  render: () => {
    const scenarios = WhatIfPanelFactory.sliderStates.incrementalSteps();
    return (
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        {scenarios.map((scenario, index) => (
          <div key={index} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>
              Adjustment: {scenario.employeeAdjustment}%
            </h4>
            <WhatIfPanel initialScenario={scenario} />
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'All possible slider positions from -5% to +5%'
      }
    }
  }
};

/**
 * Loading state simulation
 */
export const LoadingState: Story = {
  args: {
    initialScenario: WhatIfPanelFactory.default()
  },
  decorators: [
    (Story) => (
      <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
        <Story />
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)'
        }}>
          Loading scenario data...
        </div>
      </div>
    )
  ]
};

/**
 * High contrast mode
 */
export const HighContrast: Story = {
  args: {
    initialScenario: WhatIfPanelFactory.default(),
    showPerformanceBadge: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Panel with enhanced contrast for accessibility'
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ filter: 'contrast(1.5)' }}>
        <Story />
      </div>
    )
  ]
};

/**
 * Stress test with rapid updates
 */
export const StressTest: Story = {
  args: {
    initialScenario: WhatIfPanelFactory.random(),
    showPerformanceBadge: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Random scenario for stress testing calculations'
      }
    }
  }
};