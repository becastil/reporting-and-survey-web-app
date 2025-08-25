/**
 * Storybook Stories for ReportingGrid Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ReportingGrid } from './ReportingGrid';
import { ReportingGridFactory } from '@/test-utils/factories/reportingGridFactory';

const meta = {
  title: 'Dashboard/ReportingGrid',
  component: ReportingGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Interactive data grid with virtual scrolling, expandable rows, and sorting capabilities.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    viewMode: {
      control: 'radio',
      options: ['focus', 'advanced'],
      description: 'Toggle between focus and advanced view modes'
    },
    showPerformanceBadge: {
      control: 'boolean',
      description: 'Show performance metrics badge'
    },
    onRowClick: { action: 'row-clicked' },
    onSortChange: { action: 'sort-changed' }
  }
} satisfies Meta<typeof ReportingGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default grid with 12 months of data
 */
export const Default: Story = {
  args: {
    data: ReportingGridFactory.default(),
    viewMode: 'focus'
  }
};

/**
 * Advanced view with performance metrics
 */
export const AdvancedView: Story = {
  args: {
    data: ReportingGridFactory.default(),
    viewMode: 'advanced',
    showPerformanceBadge: true
  }
};

/**
 * Large dataset demonstrating virtual scrolling
 */
export const VirtualScrolling: Story = {
  args: {
    data: ReportingGridFactory.large(),
    showPerformanceBadge: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Grid with 480+ rows demonstrating virtual scrolling performance'
      }
    }
  }
};

/**
 * Empty state
 */
export const EmptyState: Story = {
  args: {
    data: []
  }
};

/**
 * Small dataset without expandable rows
 */
export const SimpleGrid: Story = {
  args: {
    data: ReportingGridFactory.edge.noLineItems()
  }
};

/**
 * Grid with deep nesting
 */
export const DeepNesting: Story = {
  args: {
    data: ReportingGridFactory.edge.deepNesting(),
    viewMode: 'advanced'
  }
};

/**
 * All positive variance (green indicators)
 */
export const PositiveTrend: Story = {
  args: {
    data: ReportingGridFactory.edge.allPositive()
  },
  parameters: {
    docs: {
      description: {
        story: 'All rows showing positive variance with green indicators'
      }
    }
  }
};

/**
 * All negative variance (red indicators)
 */
export const NegativeTrend: Story = {
  args: {
    data: ReportingGridFactory.edge.allNegative()
  },
  parameters: {
    docs: {
      description: {
        story: 'All rows showing negative variance with red indicators'
      }
    }
  }
};

/**
 * Improving trend over time
 */
export const ImprovingTrend: Story = {
  args: {
    data: ReportingGridFactory.trending('improving')
  }
};

/**
 * Declining trend over time
 */
export const DecliningTrend: Story = {
  args: {
    data: ReportingGridFactory.trending('declining')
  }
};

/**
 * Stable performance
 */
export const StableTrend: Story = {
  args: {
    data: ReportingGridFactory.trending('stable')
  }
};

/**
 * Stress test with 1000 rows
 */
export const StressTest: Story = {
  args: {
    data: ReportingGridFactory.performance.stress(),
    showPerformanceBadge: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Performance stress test with 1000 rows'
      }
    }
  }
};

/**
 * Many expandable line items
 */
export const ManyLineItems: Story = {
  args: {
    data: ReportingGridFactory.performance.withManyLineItems(),
    viewMode: 'advanced',
    showPerformanceBadge: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Each parent row has 50 line items for expansion testing'
      }
    }
  }
};

/**
 * Interactive example with callbacks
 */
export const Interactive: Story = {
  args: {
    data: ReportingGridFactory.default(),
    showPerformanceBadge: true,
    onRowClick: (row) => {
      console.log('Row clicked:', row);
      alert(`Clicked on ${row.month}: ${row.actualPEPM}`);
    },
    onSortChange: (column, direction) => {
      console.log(`Sorting by ${column} in ${direction} order`);
    }
  }
};

/**
 * Mobile responsive view
 */
export const MobileView: Story = {
  args: {
    data: ReportingGridFactory.small()
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Grid optimized for mobile devices with reduced columns'
      }
    }
  }
};

/**
 * Dark mode variant
 */
export const DarkMode: Story = {
  args: {
    data: ReportingGridFactory.default()
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    },
    docs: {
      description: {
        story: 'Grid styled for dark mode theme'
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
 * High contrast mode
 */
export const HighContrast: Story = {
  args: {
    data: ReportingGridFactory.default()
  },
  parameters: {
    docs: {
      description: {
        story: 'Grid with enhanced contrast for accessibility'
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
 * Loading state simulation
 */
export const LoadingState: Story = {
  args: {
    data: [],
    viewMode: 'focus'
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
          Loading...
        </div>
      </div>
    )
  ]
};