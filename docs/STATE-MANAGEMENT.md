# State Management & Data Flow Architecture

## Document Purpose
This document defines the state management patterns, data flow architecture, and API design for the Assured Partners Survey & Reporting Platform, ensuring predictable state updates and efficient data synchronization.

## Architecture Overview

### State Layers
```
┌─────────────────────────────────────────────┐
│            Component Local State             │
│         (useState, useReducer)              │
├─────────────────────────────────────────────┤
│           Server State (React Query)         │
│         (API data, cache, mutations)         │
├─────────────────────────────────────────────┤
│          Application State (Context)         │
│     (filters, preferences, UI state)         │
├─────────────────────────────────────────────┤
│         Persistent State (localStorage)      │
│        (user settings, draft data)           │
└─────────────────────────────────────────────┘
```

## State Management Strategy

### 1. Component Local State
**When to Use:** UI-only state that doesn't need sharing
**Tool:** React useState, useReducer

```tsx
// Simple UI state
const [isOpen, setIsOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState('overview');

// Complex local state with reducer
const [state, dispatch] = useReducer(formReducer, initialState);
```

### 2. Server State Management
**When to Use:** Data from APIs, databases
**Tool:** React Query (TanStack Query)

```tsx
// Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      cacheTime: 10 * 60 * 1000,     // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
        toast.error('Operation failed. Please try again.');
      },
    },
  },
});
```

### 3. Application State
**When to Use:** Cross-component state, global UI state
**Tool:** React Context + Custom Hooks

```tsx
// contexts/FilterContext.tsx
interface FilterState {
  client: string | null;
  organization: string | null;
  planType: string | null;
  carrier: string | null;
  funding: string | null;
  network: string | null;
  month: string | null;
}

const FilterContext = createContext<{
  filters: FilterState;
  updateFilter: (key: keyof FilterState, value: string | null) => void;
  clearFilters: () => void;
}>({} as any);

export const FilterProvider: React.FC = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  
  const updateFilter = useCallback((key: keyof FilterState, value: string | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);
  
  return (
    <FilterContext.Provider value={{ filters, updateFilter, clearFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
};
```

### 4. Persistent State
**When to Use:** User preferences, draft data
**Tool:** localStorage with sync wrapper

```tsx
// hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Broadcast to other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: JSON.stringify(valueToStore),
      }));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue] as const;
}
```

## Data Flow Patterns

### 1. Unidirectional Data Flow
```
User Action → Dispatch → State Update → UI Re-render
     ↑                                        ↓
     └────────── Side Effects ←───────────────┘
```

### 2. API Data Flow
```tsx
// hooks/useSurveyData.ts
export function useSurveyData(surveyId: string) {
  const { filters } = useFilters();
  
  return useQuery({
    queryKey: ['survey', surveyId, filters],
    queryFn: () => fetchSurveyData(surveyId, filters),
    enabled: !!surveyId,
    staleTime: 5 * 60 * 1000,
  });
}

// Usage in component
function SurveyDashboard({ surveyId }: { surveyId: string }) {
  const { data, isLoading, error } = useSurveyData(surveyId);
  
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState error={error} />;
  
  return <ReportingGrid data={data} />;
}
```

### 3. Optimistic Updates
```tsx
// hooks/useUpdateSurvey.ts
export function useUpdateSurvey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateSurvey,
    onMutate: async (newData) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries(['survey', newData.id]);
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['survey', newData.id]);
      
      // Optimistically update
      queryClient.setQueryData(['survey', newData.id], newData);
      
      return { previousData };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['survey', newData.id], context.previousData);
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries(['survey', variables.id]);
    },
  });
}
```

## State Management Patterns

### 1. Filter Synchronization
```tsx
// Unified filter state across modules
interface UnifiedFilters {
  // Shared across Survey and Reporting
  client: string | null;
  organization: string | null;
  planType: string | null;
  carrier: string | null;
  funding: string | null;
  network: string | null;
  month: string | null;
  
  // Module-specific extensions
  surveyStatus?: 'active' | 'draft' | 'closed';
  reportType?: 'variance' | 'trend' | 'benchmark';
}

// URL synchronization
export function useFilterSync() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, updateFilter } = useFilters();
  
  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);
  
  // Load filters from URL on mount
  useEffect(() => {
    searchParams.forEach((value, key) => {
      if (key in filters) {
        updateFilter(key as keyof UnifiedFilters, value);
      }
    });
  }, []); // Run once on mount
}
```

### 2. What-If Modeling State
```tsx
// contexts/WhatIfContext.tsx
interface WhatIfAdjustments {
  rebateTiming: number;      // -2 to +2 months
  employeeCount: number;      // -5% to +5%
  customScenarios: Scenario[];
}

interface Scenario {
  id: string;
  name: string;
  adjustments: Partial<WhatIfAdjustments>;
  impact: number;
}

export function WhatIfProvider({ children }: { children: React.ReactNode }) {
  const [adjustments, setAdjustments] = useState<WhatIfAdjustments>({
    rebateTiming: 0,
    employeeCount: 0,
    customScenarios: [],
  });
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedImpact, setCalculatedImpact] = useState<number>(0);
  
  const calculateImpact = useCallback(async () => {
    setIsCalculating(true);
    
    try {
      const startTime = performance.now();
      const result = await calculateWhatIfImpact(adjustments);
      const endTime = performance.now();
      
      setCalculatedImpact(result);
      
      // Track performance
      if (endTime - startTime < 50) {
        toast.success(`Calculated in ${Math.round(endTime - startTime)}ms`);
      }
    } finally {
      setIsCalculating(false);
    }
  }, [adjustments]);
  
  // Debounced calculation
  useEffect(() => {
    const timer = setTimeout(calculateImpact, 300);
    return () => clearTimeout(timer);
  }, [adjustments, calculateImpact]);
  
  return (
    <WhatIfContext.Provider value={{
      adjustments,
      setAdjustments,
      isCalculating,
      calculatedImpact,
      resetAdjustments: () => setAdjustments(initialAdjustments),
    }}>
      {children}
    </WhatIfContext.Provider>
  );
}
```

### 3. Cache Management
```tsx
// Cache strategies for different data types
const cacheConfig = {
  // Static reference data - cache aggressively
  organizations: {
    staleTime: 24 * 60 * 60 * 1000,  // 24 hours
    cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  
  // Dynamic calculation data - moderate caching
  calculations: {
    staleTime: 5 * 60 * 1000,        // 5 minutes
    cacheTime: 30 * 60 * 1000,       // 30 minutes
  },
  
  // Real-time data - minimal caching
  whatIfResults: {
    staleTime: 0,                    // Always stale
    cacheTime: 60 * 1000,            // 1 minute
  },
};

// Selective cache invalidation
export function useInvalidateCalculations() {
  const queryClient = useQueryClient();
  
  return useCallback((filters?: Partial<UnifiedFilters>) => {
    if (filters) {
      // Invalidate specific queries
      queryClient.invalidateQueries({
        queryKey: ['calculations', filters],
      });
    } else {
      // Invalidate all calculations
      queryClient.invalidateQueries({
        queryKey: ['calculations'],
      });
    }
  }, [queryClient]);
}
```

## API Layer Design

### REST API Patterns
```tsx
// lib/api/client.ts
class APIClient {
  private baseURL: string;
  private headers: HeadersInit;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }
    
    return response.json();
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new APIClient();
```

### API Response Types
```tsx
// types/api.ts
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    cached?: boolean;
    calculationTime?: number;
  };
}

interface PaginatedResponse<T> extends APIResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```

## Real-Time Updates (Future)

### WebSocket Integration Plan
```tsx
// lib/websocket/client.ts (placeholder for future)
class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  connect(url: string) {
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.ws.onclose = () => {
      this.handleReconnect();
    };
  }
  
  private handleMessage(message: any) {
    switch (message.type) {
      case 'CALCULATION_UPDATE':
        // Invalidate relevant queries
        queryClient.invalidateQueries(['calculations']);
        break;
        
      case 'FILTER_SYNC':
        // Update filter context
        break;
        
      case 'PERFORMANCE_METRIC':
        // Update performance badge
        break;
    }
  }
  
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect(this.url);
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    }
  }
}
```

## Performance Optimization

### 1. Query Deduplication
```tsx
// Prevent duplicate requests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Deduplicate requests within 2 seconds
      staleTime: 2000,
    },
  },
});
```

### 2. Prefetching
```tsx
// Prefetch next likely data
export function usePrefetchNextMonth() {
  const queryClient = useQueryClient();
  const { filters } = useFilters();
  
  return useCallback(() => {
    const nextMonth = getNextMonth(filters.month);
    
    queryClient.prefetchQuery({
      queryKey: ['calculations', { ...filters, month: nextMonth }],
      queryFn: () => fetchCalculations({ ...filters, month: nextMonth }),
    });
  }, [filters, queryClient]);
}
```

### 3. Infinite Queries
```tsx
// For paginated data
export function useInfiniteReports() {
  return useInfiniteQuery({
    queryKey: ['reports'],
    queryFn: ({ pageParam = 1 }) => fetchReports({ page: pageParam }),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.meta.hasNext ? pages.length + 1 : undefined;
    },
  });
}
```

## State DevTools

### React Query DevTools
```tsx
// app/layout.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </Providers>
      </body>
    </html>
  );
}
```

### Custom State Logger
```tsx
// lib/debug/stateLogger.ts
export function createStateLogger(name: string) {
  return (state: any, action?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`%c${name}`, 'color: #4CAF50; font-weight: bold');
      console.log('%cPrevious State:', 'color: #9E9E9E', state);
      if (action) console.log('%cAction:', 'color: #03A9F4', action);
      console.log('%cNext State:', 'color: #4CAF50', state);
      console.groupEnd();
    }
  };
}
```

## Testing State Management

### Testing Queries
```tsx
// __tests__/hooks/useSurveyData.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSurveyData } from '@/hooks/useSurveyData';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useSurveyData', () => {
  it('fetches survey data successfully', async () => {
    const { result } = renderHook(
      () => useSurveyData('survey-1'),
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toEqual(mockSurveyData);
  });
});
```

### Testing Context
```tsx
// __tests__/contexts/FilterContext.test.tsx
import { renderHook, act } from '@testing-library/react';
import { FilterProvider, useFilters } from '@/contexts/FilterContext';

describe('FilterContext', () => {
  it('updates filters correctly', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: FilterProvider,
    });
    
    act(() => {
      result.current.updateFilter('client', 'Acme Corp');
    });
    
    expect(result.current.filters.client).toBe('Acme Corp');
  });
  
  it('clears all filters', () => {
    const { result } = renderHook(() => useFilters(), {
      wrapper: FilterProvider,
    });
    
    act(() => {
      result.current.updateFilter('client', 'Acme Corp');
      result.current.clearFilters();
    });
    
    expect(result.current.filters.client).toBeNull();
  });
});
```

## Migration Path (Future)

### If State Grows Complex
```tsx
// Future migration to Zustand if needed
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppStore {
  filters: FilterState;
  whatIf: WhatIfAdjustments;
  updateFilter: (key: string, value: any) => void;
  updateWhatIf: (adjustments: Partial<WhatIfAdjustments>) => void;
  reset: () => void;
}

const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        filters: initialFilters,
        whatIf: initialWhatIf,
        updateFilter: (key, value) =>
          set((state) => ({
            filters: { ...state.filters, [key]: value },
          })),
        updateWhatIf: (adjustments) =>
          set((state) => ({
            whatIf: { ...state.whatIf, ...adjustments },
          })),
        reset: () => set({ filters: initialFilters, whatIf: initialWhatIf }),
      }),
      {
        name: 'app-storage',
      }
    )
  )
);
```

## Best Practices

### Do's ✅
- Keep component state local when possible
- Use React Query for all server state
- Implement optimistic updates for better UX
- Cache aggressively but invalidate smartly
- Use TypeScript for all state interfaces
- Test state management logic separately
- Document complex state flows
- Use proper error boundaries

### Don'ts ❌
- Don't sync server state to local state
- Don't use Context for frequently changing values
- Don't create global state unnecessarily
- Don't mutate state directly
- Don't ignore loading and error states
- Don't cache sensitive data
- Don't forget to clean up subscriptions
- Don't over-engineer simple state

---

**Document Owner:** Technical Lead
**Last Updated:** January 2025
**Architecture Version:** 1.0.0