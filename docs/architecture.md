# Assured Partners Survey & Reporting Platform - Fullstack Architecture

## Executive Summary

This document defines the comprehensive fullstack architecture for the Assured Partners Survey & Reporting Platform, a real-time benefits performance tracking system with instant what-if scenario modeling capabilities. The architecture is designed to deliver sub-50ms calculation performance while handling 1200+ survey columns through a sophisticated 3-layer data approach, supporting multi-tenancy with row-level security, and enabling $2.3M in addressable savings opportunities through data-driven insights.

### Key Architectural Decisions

- **Platform:** Vercel for unified frontend/backend deployment with edge functions
- **Database:** Neon PostgreSQL (serverless) with Upstash Redis for caching
- **Tech Stack:** Next.js 14 App Router, TypeScript, Express/Fastify API layer, REST architecture
- **Data Strategy:** 3-layer approach (Raw JSONB → Canonical Entities → Answers Table) for 1200+ columns
- **Performance:** Sub-50ms calculations via Redis caching and optimized queries
- **Security:** Row-level security (RLS) for multi-tenancy, OAuth 2.0 ready

## System Architecture Overview

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end
    
    subgraph "Vercel Edge Network"
        CDN[Vercel CDN]
        EdgeFn[Edge Functions]
        Middleware[Auth Middleware]
    end
    
    subgraph "Application Layer - Vercel"
        NextApp[Next.js 14 App]
        API[API Routes/Express]
        WSServer[WebSocket Server]
    end
    
    subgraph "Data Layer"
        Neon[(Neon PostgreSQL)]
        Upstash[(Upstash Redis)]
        S3[S3 Storage]
    end
    
    subgraph "External Services"
        Auth0[Auth0/Clerk]
        Sentry[Sentry]
        Analytics[Analytics]
    end
    
    Browser --> CDN
    Mobile --> CDN
    CDN --> EdgeFn
    EdgeFn --> Middleware
    Middleware --> NextApp
    NextApp --> API
    API --> Neon
    API --> Upstash
    API --> S3
    NextApp --> WSServer
    WSServer --> Upstash
    API --> Auth0
    API --> Sentry
    NextApp --> Analytics
```

### Component Architecture

```
survey-platform/
├── apps/
│   ├── web/                    # Next.js 14 App Router
│   │   ├── app/
│   │   │   ├── (auth)/         # Auth routes
│   │   │   ├── (dashboard)/    # Protected routes
│   │   │   ├── api/            # API routes
│   │   │   └── _components/    # Server components
│   │   ├── components/         # Client components
│   │   ├── lib/               # Utilities
│   │   └── styles/            # Tailwind config
│   │
│   └── api/                    # Express/Fastify service
│       ├── src/
│       │   ├── routes/        # REST endpoints
│       │   ├── services/      # Business logic
│       │   ├── models/        # Data models
│       │   ├── middleware/    # Auth, validation
│       │   └── utils/         # Helpers
│       └── tests/
│
├── packages/
│   ├── database/              # Prisma schema & migrations
│   ├── shared/                # Shared types & utils
│   ├── ui/                    # Component library
│   └── calculations/          # Calculation engine
│
├── infrastructure/
│   ├── terraform/             # IaC definitions
│   ├── docker/                # Container configs
│   └── scripts/               # Deployment scripts
│
└── docs/
    ├── api/                   # OpenAPI specs
    ├── architecture/          # ADRs
    └── runbooks/             # Operational guides
```

## Frontend Architecture

### Technology Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript 5.x with strict mode
- **Styling:** Tailwind CSS 3.x with custom design system
- **State Management:** Zustand for client state, TanStack Query for server state
- **Visualization:** Plotly.js for charts, AG-Grid for data tables
- **Forms:** React Hook Form with Zod validation
- **Testing:** Jest, React Testing Library, Playwright

### Component Architecture

```typescript
// Component hierarchy
<DashboardLayout>
  <NavigationHeader />
  <FilterBar />
  <MainContent>
    <MoneyMeter />
    <ReportingGrid />
    <WhatIfPanel>
      <RebateSlider />
      <EmployeeSlider />
    </WhatIfPanel>
    <PeerComparison />
  </MainContent>
  <PerformanceBadge />
</DashboardLayout>
```

### Key Frontend Patterns

#### 1. Server Components for Initial Data
```typescript
// app/(dashboard)/reports/page.tsx
export default async function ReportsPage() {
  const initialData = await fetchReportData();
  
  return (
    <ReportingProvider initialData={initialData}>
      <ReportingGrid />
      <WhatIfModeling />
    </ReportingProvider>
  );
}
```

#### 2. Optimistic Updates with TanStack Query
```typescript
// hooks/useWhatIfModeling.ts
export function useWhatIfModeling() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: updateModelParameters,
    onMutate: async (newParams) => {
      await queryClient.cancelQueries({ queryKey: ['calculations'] });
      const previousData = queryClient.getQueryData(['calculations']);
      
      // Optimistic update
      queryClient.setQueryData(['calculations'], (old) => 
        calculateNewValues(old, newParams)
      );
      
      return { previousData };
    },
    onError: (err, newParams, context) => {
      queryClient.setQueryData(['calculations'], context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['calculations'] });
    },
  });
  
  return mutation;
}
```

#### 3. Performance Monitoring HOC
```typescript
// components/PerformanceMonitor.tsx
export function withPerformanceTracking<T>(
  Component: React.ComponentType<T>,
  metricName: string
) {
  return function PerformanceWrapped(props: T) {
    const startTime = performance.now();
    
    useEffect(() => {
      const duration = performance.now() - startTime;
      trackMetric(metricName, duration);
      updatePerformanceBadge(duration);
    }, []);
    
    return <Component {...props} />;
  };
}
```

### State Management Architecture

```typescript
// stores/reportingStore.ts
interface ReportingState {
  // Data
  organizations: Organization[];
  reports: Report[];
  calculations: Calculation[];
  
  // UI State
  filters: FilterState;
  viewMode: 'focus' | 'advanced';
  selectedOrganization: string | null;
  
  // What-If Parameters
  rebateOffset: number; // -2 to +2 months
  employeeAdjustment: number; // -5% to +5%
  
  // Actions
  setFilters: (filters: Partial<FilterState>) => void;
  updateWhatIfParams: (params: WhatIfParams) => void;
  resetToBaseline: () => void;
}

export const useReportingStore = create<ReportingState>()(
  devtools(
    persist(
      (set) => ({
        // Implementation
      }),
      {
        name: 'reporting-storage',
        partialize: (state) => ({ filters: state.filters }),
      }
    )
  )
);
```

## Backend Architecture

### Technology Stack

- **Runtime:** Node.js 20 LTS
- **Framework:** Express with TypeScript (Fastify alternative ready)
- **ORM:** Prisma with PostgreSQL
- **Caching:** Upstash Redis with connection pooling
- **Validation:** Zod for request/response validation
- **Authentication:** JWT with refresh tokens
- **Testing:** Jest, Supertest, k6 for load testing

### API Architecture

#### RESTful Endpoint Structure
```
/api/v1/
├── /auth
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /refresh
│   └── GET    /me
│
├── /organizations
│   ├── GET    /           # List with pagination
│   ├── POST   /           # Create
│   ├── GET    /:id        # Get details
│   ├── PUT    /:id        # Update
│   └── DELETE /:id        # Soft delete
│
├── /surveys
│   ├── POST   /upload     # CSV upload
│   ├── GET    /           # List surveys
│   ├── GET    /:id        # Get survey data
│   └── POST   /validate   # Validate CSV
│
├── /reports
│   ├── GET    /           # Get reports with filters
│   ├── GET    /aggregate  # Aggregated data
│   ├── POST   /calculate  # Trigger calculations
│   └── GET    /export     # Export data
│
├── /calculations
│   ├── POST   /what-if    # What-if scenarios
│   ├── GET    /cohort     # Peer comparison
│   └── GET    /metrics    # Key metrics
│
└── /system
    ├── GET    /health     # Health check
    ├── GET    /metrics    # Prometheus metrics
    └── GET    /version    # API version
```

### Service Layer Architecture

```typescript
// services/CalculationService.ts
export class CalculationService {
  constructor(
    private db: PrismaClient,
    private cache: RedisClient,
    private logger: Logger
  ) {}

  async calculatePEPM(params: PEPMParams): Promise<PEPMResult> {
    const cacheKey = this.getCacheKey(params);
    
    // Check cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      this.logger.info('Cache hit for PEPM calculation');
      return JSON.parse(cached);
    }
    
    // Perform calculation
    const startTime = performance.now();
    
    const result = await this.db.$transaction(async (tx) => {
      const claims = await tx.claims.aggregate({
        where: params.filters,
        _sum: { amount: true },
      });
      
      const members = await tx.members.count({
        where: params.filters,
      });
      
      const pepm = claims._sum.amount / members / params.months;
      
      return {
        pepm,
        claims: claims._sum.amount,
        memberMonths: members * params.months,
        calculationTime: performance.now() - startTime,
      };
    });
    
    // Cache result
    await this.cache.setex(cacheKey, 300, JSON.stringify(result));
    
    return result;
  }
  
  async performWhatIfAnalysis(
    baseData: BaseData,
    adjustments: WhatIfAdjustments
  ): Promise<WhatIfResult> {
    // Parallel calculations for performance
    const [rebateImpact, employeeImpact] = await Promise.all([
      this.calculateRebateImpact(baseData, adjustments.rebateOffset),
      this.calculateEmployeeImpact(baseData, adjustments.employeeAdjustment),
    ]);
    
    return {
      original: baseData.metrics,
      adjusted: this.combineAdjustments(baseData.metrics, rebateImpact, employeeImpact),
      variance: this.calculateVariance(baseData.metrics, adjustedMetrics),
      savingsOpportunity: this.calculateSavings(variance),
      calculationTime: performance.now() - startTime,
    };
  }
}
```

### Middleware Architecture

```typescript
// middleware/performanceTracking.ts
export const performanceTracking = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = performance.now();
  
  res.on('finish', () => {
    const duration = performance.now() - start;
    
    // Log to metrics system
    metrics.histogram('http_request_duration_ms', duration, {
      method: req.method,
      route: req.route?.path,
      status: res.statusCode,
    });
    
    // Add performance header
    res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    
    // Update performance badge if under threshold
    if (duration < 50) {
      res.setHeader('X-Performance-Badge', 'fast');
    }
  });
  
  next();
};
```

## Data Architecture

### Database Schema Strategy (3-Layer Approach)

#### Layer 1: Raw Survey Data (JSONB)
```sql
-- Store raw survey responses with 1200+ columns
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  survey_period DATE NOT NULL,
  raw_data JSONB NOT NULL, -- Stores all 1200+ columns
  file_metadata JSONB,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  uploaded_by UUID REFERENCES users(id),
  
  -- Indexing for JSONB queries
  CONSTRAINT valid_raw_data CHECK (jsonb_typeof(raw_data) = 'object')
);

-- Optimize JSONB queries
CREATE INDEX idx_survey_responses_raw_data ON survey_responses USING gin(raw_data);
CREATE INDEX idx_survey_responses_org_period ON survey_responses(organization_id, survey_period);
```

#### Layer 2: Canonical Entities
```sql
-- Normalized core business entities
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  funding_type VARCHAR(50),
  carrier VARCHAR(100),
  plan_type VARCHAR(50),
  network_breadth VARCHAR(50),
  size_category VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  report_month DATE NOT NULL,
  pepm_actual DECIMAL(10, 2),
  pepm_target DECIMAL(10, 2),
  variance_amount DECIMAL(12, 2),
  variance_percent DECIMAL(5, 2),
  line_items JSONB, -- Claims, rebates, stop-loss, admin breakdown
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(organization_id, report_month)
);

-- Performance metrics table
CREATE TABLE calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id),
  calculation_type VARCHAR(50) NOT NULL,
  input_params JSONB NOT NULL,
  result JSONB NOT NULL,
  calculation_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Layer 3: Answers/Metrics Table
```sql
-- Extracted and calculated answers for quick access
CREATE TABLE survey_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_response_id UUID NOT NULL REFERENCES survey_responses(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  question_key VARCHAR(255) NOT NULL,
  answer_value TEXT,
  answer_numeric DECIMAL(15, 4),
  answer_date DATE,
  answer_boolean BOOLEAN,
  data_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Composite index for efficient queries
  UNIQUE(survey_response_id, question_key)
);

CREATE INDEX idx_survey_answers_org_key ON survey_answers(organization_id, question_key);
CREATE INDEX idx_survey_answers_numeric ON survey_answers(answer_numeric) WHERE answer_numeric IS NOT NULL;
```

### Multi-Tenancy with Row-Level Security

```sql
-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY tenant_isolation_organizations ON organizations
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation_reports ON reports
  FOR ALL
  USING (
    organization_id IN (
      SELECT id FROM organizations 
      WHERE tenant_id = current_setting('app.current_tenant')::uuid
    )
  );

-- Function to set current tenant
CREATE OR REPLACE FUNCTION set_current_tenant(tenant_uuid UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_uuid::text, false);
END;
$$ LANGUAGE plpgsql;
```

### Redis Caching Strategy

```typescript
// Cache key patterns
const cacheKeys = {
  // User session data
  session: (userId: string) => `session:${userId}`,
  
  // Calculation results (TTL: 5 minutes)
  calculation: (orgId: string, params: string) => 
    `calc:${orgId}:${hash(params)}`,
  
  // Report data (TTL: 1 hour)
  report: (orgId: string, month: string) => 
    `report:${orgId}:${month}`,
  
  // Cohort matches (TTL: 24 hours)
  cohort: (orgId: string) => `cohort:${orgId}`,
  
  // Aggregations (TTL: 15 minutes)
  aggregation: (filters: string) => 
    `agg:${hash(filters)}`,
};

// Cache invalidation patterns
export class CacheManager {
  async invalidateOrganization(orgId: string) {
    const pattern = `*:${orgId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
  
  async warmCache(orgId: string) {
    // Pre-calculate common queries
    const commonQueries = [
      { period: 'current', type: 'pepm' },
      { period: 'ytd', type: 'variance' },
      { period: 'trailing12', type: 'trend' },
    ];
    
    await Promise.all(
      commonQueries.map(query => 
        this.calculateAndCache(orgId, query)
      )
    );
  }
}
```

## Performance Architecture

### Sub-50ms Response Strategy

#### 1. Database Optimization
```sql
-- Materialized views for complex calculations
CREATE MATERIALIZED VIEW mv_organization_metrics AS
SELECT 
  o.id as org_id,
  o.name,
  r.report_month,
  AVG(r.pepm_actual) as avg_pepm,
  SUM(r.variance_amount) as total_variance,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.pepm_actual) as median_pepm
FROM organizations o
JOIN reports r ON o.id = r.organization_id
GROUP BY o.id, o.name, r.report_month;

CREATE INDEX idx_mv_org_metrics ON mv_organization_metrics(org_id, report_month);

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_metrics_view()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_organization_metrics;
END;
$$ LANGUAGE plpgsql;
```

#### 2. Query Optimization
```typescript
// Parallel query execution
export class ReportService {
  async getDashboardData(orgId: string): Promise<DashboardData> {
    // Execute queries in parallel
    const [
      currentMetrics,
      historicalTrend,
      peerComparison,
      variance
    ] = await Promise.all([
      this.getCurrentMetrics(orgId),
      this.getHistoricalTrend(orgId),
      this.getPeerComparison(orgId),
      this.getVarianceBreakdown(orgId),
    ]);
    
    return {
      metrics: currentMetrics,
      trend: historicalTrend,
      peers: peerComparison,
      variance: variance,
      calculationTime: performance.now() - startTime,
    };
  }
}
```

#### 3. Edge Caching with Vercel
```typescript
// app/api/reports/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Cache at edge for 60 seconds
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=60, stale-while-revalidate',
    },
  });
}
```

### Performance Monitoring

```typescript
// lib/performance.ts
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  async track<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.recordMetric(operation, duration);
      
      // Alert if exceeding threshold
      if (duration > 50) {
        this.alertSlowOperation(operation, duration);
      }
      
      return result;
    } catch (error) {
      this.recordError(operation, error);
      throw error;
    }
  }
  
  getP95(operation: string): number {
    const metrics = this.metrics.get(operation) || [];
    return this.calculatePercentile(metrics, 95);
  }
}
```

## Security Architecture

### Authentication & Authorization

```typescript
// middleware/auth.ts
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = await verifyJWT(token);
    
    // Set tenant context for RLS
    await db.$executeRaw`SELECT set_current_tenant(${decoded.tenantId}::uuid)`;
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Role-based access control
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### Data Security

```typescript
// utils/encryption.ts
export class DataEncryption {
  private algorithm = 'aes-256-gcm';
  
  async encryptSensitiveData(data: any): Promise<EncryptedData> {
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(64);
    const key = crypto.pbkdf2Sync(
      process.env.ENCRYPTION_KEY!,
      salt,
      100000,
      32,
      'sha256'
    );
    
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(data), 'utf8'),
      cipher.final(),
    ]);
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted.toString('base64'),
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
    };
  }
}
```

## Deployment Architecture

### Vercel Deployment Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "regions": ["iad1"],
  "functions": {
    "app/api/calculations/what-if/route.ts": {
      "maxDuration": 10,
      "memory": 512
    },
    "app/api/reports/export/route.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "crons": [
    {
      "path": "/api/cron/refresh-cache",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/cleanup-exports",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Environment Configuration

```bash
# .env.production
# Database
DATABASE_URL="postgresql://user:pass@neon.tech/db?sslmode=require"
DATABASE_POOL_URL="postgresql://user:pass@neon.tech/db?sslmode=require&pgbouncer=true"

# Redis
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# Auth
NEXTAUTH_URL="https://platform.assuredpartners.com"
NEXTAUTH_SECRET="xxx"
JWT_SECRET="xxx"

# Storage
AWS_S3_BUCKET="assured-partners-uploads"
AWS_ACCESS_KEY_ID="xxx"
AWS_SECRET_ACCESS_KEY="xxx"

# Monitoring
SENTRY_DSN="https://xxx@sentry.io/xxx"
DATADOG_API_KEY="xxx"

# Feature Flags
ENABLE_WHAT_IF_MODELING=true
ENABLE_PEER_COMPARISON=true
ENABLE_GUIDED_DEMO=true
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test:unit
      - run: pnpm test:integration
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring & Observability

### Metrics Collection

```typescript
// lib/metrics.ts
import { Counter, Histogram, register } from 'prom-client';

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status'],
  buckets: [10, 25, 50, 100, 250, 500, 1000],
});

export const calculationDuration = new Histogram({
  name: 'calculation_duration_ms',
  help: 'Duration of calculations in ms',
  labelNames: ['type'],
  buckets: [5, 10, 25, 42, 50, 75, 100],
});

export const cacheHitRate = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type'],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(calculationDuration);
register.registerMetric(cacheHitRate);
```

### Logging Strategy

```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'assured-partners-platform',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
    }),
  ],
});

// Structured logging for calculations
export function logCalculation(
  type: string,
  params: any,
  result: any,
  duration: number
) {
  logger.info('Calculation completed', {
    calculationType: type,
    inputParams: params,
    resultSummary: {
      value: result.value,
      variance: result.variance,
    },
    performanceMs: duration,
    performanceBadge: duration < 50 ? '⚡ Fast' : '🐢 Slow',
  });
}
```

## Testing Strategy

### Test Pyramid Implementation

```typescript
// Test structure
tests/
├── unit/                    # 80% coverage target
│   ├── calculations/       # Business logic
│   ├── services/          # Service layer
│   └── utils/            # Utilities
│
├── integration/            # API and DB tests
│   ├── api/              # Endpoint testing
│   ├── database/        # Query testing
│   └── cache/          # Redis testing
│
├── e2e/                   # Critical flows
│   ├── upload-flow.spec.ts
│   ├── calculation-flow.spec.ts
│   └── export-flow.spec.ts
│
└── performance/           # Load testing
    ├── calculations.k6.js
    └── api-endpoints.k6.js
```

### Performance Test Example

```javascript
// tests/performance/calculations.k6.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<50'], // 95% of requests under 50ms
  },
};

export default function () {
  const payload = JSON.stringify({
    organizationId: 'test-org',
    rebateOffset: 1,
    employeeAdjustment: 0.02,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${__ENV.TEST_TOKEN}`,
    },
  };

  const res = http.post(
    'http://localhost:3000/api/v1/calculations/what-if',
    payload,
    params
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'calculation under 50ms': (r) => {
      const duration = r.headers['X-Response-Time'];
      return parseFloat(duration) < 50;
    },
  });
}
```

## Disaster Recovery

### Backup Strategy

```sql
-- Automated backup configuration for Neon
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily backup of critical tables
SELECT cron.schedule(
  'backup-critical-data',
  '0 2 * * *',
  $$
    COPY (
      SELECT * FROM organizations
      WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days'
    ) TO '/backups/organizations_backup.csv' WITH CSV HEADER;
  $$
);

-- Point-in-time recovery setup
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET archive_mode = on;
ALTER SYSTEM SET archive_command = 'aws s3 cp %p s3://backups/wal/%f';
```

### Recovery Procedures

```typescript
// scripts/disaster-recovery.ts
export class DisasterRecovery {
  async performHealthCheck(): Promise<HealthStatus> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkStorage(),
      this.checkAPI(),
    ]);
    
    return {
      healthy: checks.every(c => c.healthy),
      services: checks,
      timestamp: new Date().toISOString(),
    };
  }
  
  async restoreFromBackup(backupId: string): Promise<void> {
    // 1. Put application in maintenance mode
    await this.enableMaintenanceMode();
    
    // 2. Restore database
    await this.restoreDatabase(backupId);
    
    // 3. Clear and warm caches
    await this.redis.flushall();
    await this.warmCaches();
    
    // 4. Verify data integrity
    await this.verifyDataIntegrity();
    
    // 5. Resume normal operations
    await this.disableMaintenanceMode();
  }
}
```

## MVP Demo Features Implementation

### 1. What-If Sliders (Story 1.4)
- Real-time recalculation with WebSocket updates
- Optimistic UI updates for instant feedback
- Redis-cached baseline for quick resets

### 2. Money Meter (Story 1.5)
- Animated SVG component with progressive reveal
- Calculation transparency modal on click
- Auto-refresh on filter changes

### 3. Cohort Comparison (Story 1.6)
- K-nearest neighbor algorithm in PostgreSQL
- Cached cohort matches for 24 hours
- Visual overlay on main reporting grid

### 4. Guided Demo Mode (Story 1.8)
- React Joyride integration for step-by-step tour
- Persistent demo progress in localStorage
- Analytics tracking for demo completion

## Future Considerations

### Scaling Path
1. **Phase 1 (Current):** Monolithic with clear boundaries
2. **Phase 2:** Extract calculation engine as microservice
3. **Phase 3:** Separate read/write models (CQRS)
4. **Phase 4:** Full microservices with event sourcing

### AI/ML Integration Points
- Anomaly detection in variance patterns
- Predictive modeling for future PEPM
- Natural language query interface
- Automated insight generation

### Multi-Region Strategy
- Vercel Edge Functions for global distribution
- Read replicas in multiple regions
- Eventually consistent data synchronization
- Regional compliance considerations

## Conclusion

This architecture provides a solid foundation for the Assured Partners Survey & Reporting Platform, delivering sub-50ms performance while maintaining flexibility for future growth. The 3-layer data approach efficiently handles 1200+ survey columns, while the combination of Neon PostgreSQL and Upstash Redis ensures both data persistence and lightning-fast calculations. The platform is ready for immediate MVP deployment while being architected for long-term scalability and feature expansion.

---

*Architecture Version 1.0 - Created by Winston (Chief Architect)*  
*Date: January 2025*  
*Status: Ready for Implementation*