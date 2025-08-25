# API Design & Data Flow Specification

## Document Purpose
This document defines the API architecture, endpoint design, request/response patterns, and data flow for the Assured Partners platform, ensuring consistent and performant data operations.

## API Architecture

### RESTful Design Principles
- **Resource-Based:** URLs identify resources (nouns not verbs)
- **Stateless:** Each request contains all necessary information
- **Cacheable:** Responses include cache control headers
- **Uniform Interface:** Consistent patterns across all endpoints
- **Layered System:** Clear separation between API and business logic

### Base Configuration
```typescript
// Production
https://api.assuredpartners.com/v1

// Staging
https://staging-api.assuredpartners.com/v1

// Development
http://localhost:3000/api
```

## Core API Endpoints

### Survey Module

#### GET /api/surveys
**Purpose:** Retrieve list of surveys with filtering
```typescript
// Request
GET /api/surveys?status=active&organization=acme-corp&page=1&limit=20

// Response
{
  "success": true,
  "data": [
    {
      "id": "survey-uuid",
      "title": "Q1 2025 Benefits Survey",
      "description": "Quarterly benefits data collection",
      "status": "active",
      "organizationId": "org-uuid",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-15T00:00:00Z",
      "responseCount": 42,
      "targetCount": 50,
      "completionRate": 0.84
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "hasNext": true,
    "hasPrevious": false,
    "cached": false,
    "responseTime": 23
  }
}
```

#### POST /api/surveys
**Purpose:** Create new survey
```typescript
// Request
{
  "title": "Q2 2025 Benefits Survey",
  "description": "Quarterly data collection",
  "organizationId": "org-uuid",
  "sections": [
    {
      "title": "Medical Claims",
      "questions": [
        {
          "type": "currency",
          "question": "Total medical claims",
          "required": true,
          "validation": {
            "min": 0,
            "max": 10000000
          }
        }
      ]
    }
  ]
}

// Response
{
  "success": true,
  "data": {
    "id": "new-survey-uuid",
    "title": "Q2 2025 Benefits Survey",
    "status": "draft",
    "createdAt": "2025-01-20T00:00:00Z"
  }
}
```

#### GET /api/surveys/:id
**Purpose:** Get single survey with full details
```typescript
// Response includes sections and questions
{
  "success": true,
  "data": {
    "id": "survey-uuid",
    "title": "Q1 2025 Benefits Survey",
    "sections": [
      {
        "id": "section-uuid",
        "title": "Medical Claims",
        "order": 0,
        "questions": [...]
      }
    ],
    "responses": {
      "total": 42,
      "completed": 38,
      "inProgress": 4
    }
  }
}
```

#### POST /api/surveys/:id/responses
**Purpose:** Submit survey response
```typescript
// Request
{
  "organizationId": "org-uuid",
  "responses": {
    "question-uuid-1": 1500000,
    "question-uuid-2": 250000,
    "question-uuid-3": "self-funded"
  },
  "metadata": {
    "submittedBy": "user-uuid",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}

// Response
{
  "success": true,
  "data": {
    "id": "response-uuid",
    "surveyId": "survey-uuid",
    "status": "completed",
    "submittedAt": "2025-01-20T10:30:00Z"
  }
}
```

### Reporting Module

#### POST /api/reports/upload
**Purpose:** Upload CSV data for processing
```typescript
// Request (multipart/form-data)
{
  "file": File,
  "organizationId": "org-uuid",
  "period": "2025-01",
  "type": "monthly-variance"
}

// Response
{
  "success": true,
  "data": {
    "uploadId": "upload-uuid",
    "status": "processing",
    "rowCount": 1000,
    "validationErrors": [],
    "processingTime": null
  }
}
```

#### GET /api/reports/upload/:id/status
**Purpose:** Check upload processing status
```typescript
// Response
{
  "success": true,
  "data": {
    "uploadId": "upload-uuid",
    "status": "completed", // processing | completed | failed
    "progress": 100,
    "rowsProcessed": 1000,
    "rowsSkipped": 0,
    "processingTime": 2341,
    "errors": []
  }
}
```

### Calculation Engine

#### POST /api/calculations/pepm
**Purpose:** Calculate PEPM metrics
```typescript
// Request
{
  "organizationId": "org-uuid",
  "period": "2025-01",
  "data": {
    "totalClaims": 2500000,
    "memberMonths": 12000,
    "adminFees": 50000,
    "stopLossRecovery": 100000
  }
}

// Response
{
  "success": true,
  "data": {
    "pepmActual": 208.33,
    "pepmTarget": 195.00,
    "variance": 13.33,
    "variancePercent": 6.84,
    "breakdown": {
      "medical": 150.00,
      "rx": 45.00,
      "admin": 4.17,
      "stopLoss": -8.33
    }
  },
  "meta": {
    "calculationTime": 42,
    "cached": false,
    "formula": "PEPM = (Total Claims + Admin - Stop Loss) / Member Months"
  }
}
```

#### POST /api/calculations/what-if
**Purpose:** Real-time what-if modeling
```typescript
// Request
{
  "baseData": {
    "pepmActual": 208.33,
    "memberMonths": 12000,
    "rebates": {
      "q1": 50000,
      "q2": 60000,
      "q3": 55000,
      "q4": 0
    }
  },
  "adjustments": {
    "rebateTiming": 1,        // Shift by 1 month
    "employeeCount": 2.5      // Increase by 2.5%
  }
}

// Response
{
  "success": true,
  "data": {
    "original": {
      "pepm": 208.33,
      "totalCost": 2500000
    },
    "adjusted": {
      "pepm": 201.45,
      "totalCost": 2478750
    },
    "impact": {
      "pepmChange": -6.88,
      "percentChange": -3.30,
      "dollarImpact": -21250
    }
  },
  "meta": {
    "calculationTime": 38,
    "cached": false
  }
}
```

#### GET /api/calculations/variance
**Purpose:** Get variance analysis
```typescript
// Request
GET /api/calculations/variance?org=org-uuid&period=2025-01&groupBy=category

// Response
{
  "success": true,
  "data": {
    "totalVariance": 325000,
    "breakdown": [
      {
        "category": "Medical Claims",
        "actual": 1800000,
        "target": 1650000,
        "variance": 150000,
        "percent": 9.09
      },
      {
        "category": "Rx Claims",
        "actual": 540000,
        "target": 495000,
        "variance": 45000,
        "percent": 9.09
      },
      {
        "category": "Rebates",
        "actual": -50000,
        "target": -180000,
        "variance": 130000,
        "percent": -72.22
      }
    ]
  }
}
```

### Cohort & Benchmarking

#### GET /api/cohorts/similar
**Purpose:** Find similar organizations
```typescript
// Request
GET /api/cohorts/similar?org=org-uuid&dimensions=funding,size,carrier

// Response
{
  "success": true,
  "data": {
    "sourceOrg": "org-uuid",
    "cohortSize": 5,
    "similarOrgs": [
      {
        "id": "peer-org-1",
        "name": "Similar Corp A",
        "similarityScore": 0.92,
        "dimensions": {
          "funding": "self-funded",
          "size": "1000-5000",
          "carrier": "BCBS"
        }
      }
    ],
    "benchmarks": {
      "pepmAverage": 195.50,
      "pepmMedian": 192.00,
      "pepmP25": 185.00,
      "pepmP75": 205.00
    }
  }
}
```

## API Patterns

### Error Handling
```typescript
// Standard error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "memberMonths",
        "message": "Must be greater than 0"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-20T10:30:00Z",
    "requestId": "req-uuid",
    "traceId": "trace-uuid"
  }
}

// Error codes
enum ErrorCodes {
  VALIDATION_ERROR = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  RATE_LIMITED = 429,
  SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}
```

### Authentication & Authorization
```typescript
// Headers
{
  "Authorization": "Bearer <clerk-token>",
  "X-Organization-ID": "org-uuid",
  "X-Request-ID": "req-uuid"
}

// Token validation middleware
export async function validateToken(req: Request) {
  const token = req.headers.get('Authorization')?.split(' ')[1];
  
  if (!token) {
    throw new UnauthorizedError('No token provided');
  }
  
  const session = await clerkClient.verifyToken(token);
  
  if (!session) {
    throw new UnauthorizedError('Invalid token');
  }
  
  return session;
}
```

### Rate Limiting
```typescript
// Response headers
{
  "X-RateLimit-Limit": "100",
  "X-RateLimit-Remaining": "42",
  "X-RateLimit-Reset": "1705750800"
}

// Rate limit configuration
const rateLimits = {
  anonymous: {
    requests: 10,
    window: '1m',
  },
  authenticated: {
    requests: 100,
    window: '1m',
  },
  calculation: {
    requests: 1000,
    window: '1h',
  },
};
```

### Caching Strategy
```typescript
// Cache headers
{
  "Cache-Control": "public, max-age=300, s-maxage=600",
  "ETag": "W/\"123-abc\"",
  "X-Cache": "HIT",
  "X-Cache-Age": "145"
}

// Cache configuration by endpoint
const cacheConfig = {
  '/api/surveys': {
    ttl: 300,           // 5 minutes
    tags: ['surveys'],
  },
  '/api/calculations/pepm': {
    ttl: 3600,          // 1 hour
    tags: ['calculations', 'pepm'],
  },
  '/api/cohorts/similar': {
    ttl: 86400,         // 24 hours
    tags: ['cohorts'],
  },
};
```

### Pagination
```typescript
// Request
GET /api/reports?page=2&limit=20&sort=createdAt:desc

// Response
{
  "data": [...],
  "meta": {
    "pagination": {
      "page": 2,
      "limit": 20,
      "total": 245,
      "totalPages": 13,
      "hasNext": true,
      "hasPrevious": true
    },
    "links": {
      "first": "/api/reports?page=1&limit=20",
      "prev": "/api/reports?page=1&limit=20",
      "next": "/api/reports?page=3&limit=20",
      "last": "/api/reports?page=13&limit=20"
    }
  }
}
```

### Filtering & Sorting
```typescript
// Complex filtering
GET /api/reports?
  filter[organization]=org-uuid&
  filter[period]=2025-01&
  filter[variance.gt]=10000&
  sort=-variance,createdAt

// Parser implementation
function parseFilters(query: URLSearchParams) {
  const filters = {};
  
  for (const [key, value] of query.entries()) {
    if (key.startsWith('filter[')) {
      const field = key.slice(7, -1);
      
      if (field.includes('.')) {
        // Handle operators: gt, lt, gte, lte, eq, ne
        const [fieldName, operator] = field.split('.');
        filters[fieldName] = { [operator]: value };
      } else {
        filters[field] = value;
      }
    }
  }
  
  return filters;
}
```

## WebSocket Events (Future)

### Event Types
```typescript
// Client -> Server
{
  "type": "SUBSCRIBE",
  "channel": "calculations:org-uuid",
  "auth": "Bearer token"
}

// Server -> Client
{
  "type": "CALCULATION_UPDATE",
  "channel": "calculations:org-uuid",
  "data": {
    "pepm": 205.45,
    "variance": 10.45,
    "timestamp": "2025-01-20T10:30:00Z"
  }
}

// Event channels
const channels = {
  calculations: 'calculations:{orgId}',
  whatIf: 'whatif:{sessionId}',
  uploads: 'uploads:{uploadId}',
  cohorts: 'cohorts:{orgId}',
};
```

## Performance Monitoring

### Request Tracing
```typescript
// Trace headers
{
  "X-Trace-ID": "trace-uuid",
  "X-Span-ID": "span-uuid",
  "X-Parent-Span-ID": "parent-span-uuid"
}

// Performance metrics in response
{
  "meta": {
    "performance": {
      "dbQuery": 15,      // ms
      "calculation": 25,  // ms
      "serialization": 2, // ms
      "total": 42        // ms
    }
  }
}
```

### Health Check Endpoint
```typescript
// GET /api/health
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 864000,
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "clerk": "healthy",
    "s3": "healthy"
  },
  "metrics": {
    "requestsPerMinute": 450,
    "averageResponseTime": 35,
    "errorRate": 0.001
  }
}
```

## API Versioning

### Version Strategy
```typescript
// URL versioning (primary)
/api/v1/surveys
/api/v2/surveys

// Header versioning (alternative)
{
  "Accept": "application/vnd.assuredpartners.v2+json"
}

// Deprecation notice
{
  "X-API-Deprecation": "true",
  "X-API-Deprecation-Date": "2025-12-31",
  "X-API-Deprecation-Info": "https://docs.api.com/deprecation"
}
```

## Security Considerations

### Input Validation
```typescript
// Zod schema example
const calculationSchema = z.object({
  organizationId: z.string().uuid(),
  period: z.string().regex(/^\d{4}-\d{2}$/),
  data: z.object({
    totalClaims: z.number().min(0).max(1000000000),
    memberMonths: z.number().int().min(1),
    adminFees: z.number().min(0),
    stopLossRecovery: z.number().min(0),
  }),
});

// Validation middleware
export function validate(schema: ZodSchema) {
  return async (req: Request) => {
    const result = schema.safeParse(await req.json());
    
    if (!result.success) {
      throw new ValidationError(result.error);
    }
    
    return result.data;
  };
}
```

### SQL Injection Prevention
```typescript
// Use parameterized queries
const result = await db
  .select()
  .from(organizations)
  .where(eq(organizations.id, orgId)) // Safe
  .limit(1);

// Never use string concatenation
// BAD: `SELECT * FROM orgs WHERE id = '${orgId}'`
```

### CORS Configuration
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}
```

## Testing API Endpoints

### Integration Tests
```typescript
// __tests__/api/calculations.test.ts
describe('POST /api/calculations/pepm', () => {
  it('calculates PEPM correctly', async () => {
    const response = await request(app)
      .post('/api/calculations/pepm')
      .set('Authorization', 'Bearer test-token')
      .send({
        organizationId: 'test-org',
        period: '2025-01',
        data: {
          totalClaims: 2500000,
          memberMonths: 12000,
          adminFees: 50000,
          stopLossRecovery: 100000,
        },
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.pepmActual).toBeCloseTo(208.33, 2);
  });
  
  it('validates input data', async () => {
    const response = await request(app)
      .post('/api/calculations/pepm')
      .set('Authorization', 'Bearer test-token')
      .send({
        organizationId: 'invalid',
        period: 'invalid',
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

---

**Document Owner:** API Architect
**Last Updated:** January 2025
**API Version:** 1.0.0