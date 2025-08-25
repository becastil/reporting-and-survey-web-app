# API Rate Limits & Fallback Strategies

## Overview
This document outlines rate limits for all external services and our fallback strategies to ensure platform resilience.

## Service Rate Limits

### 1. Clerk Authentication

| Limit Type | Free Tier | Pro Tier | Our Strategy |
|------------|-----------|----------|--------------|
| API Requests | 100/second | 1000/second | Implement request pooling |
| Monthly Active Users | 5,000 | Unlimited | Monitor approaching limit |
| Sign-ins | No limit | No limit | - |
| Organizations | 5 | Unlimited | Use single org for MVP |

**Error Codes:**
- `429`: Rate limit exceeded → Exponential backoff
- `403`: Quota exceeded → Show upgrade prompt
- `503`: Service unavailable → Fallback to cached session

**Fallback Strategy:**
```typescript
// Clerk outage fallback
if (clerkStatus === 'down') {
  // 1. Check Redis for cached session
  // 2. Allow read-only access for existing sessions
  // 3. Show maintenance banner for new logins
  // 4. Queue authentication requests for retry
}
```

### 2. Neon Database

| Limit Type | Free Tier | Pro Tier | Our Strategy |
|------------|-----------|----------|--------------|
| Storage | 3GB | Unlimited | Monitor usage at 80% |
| Compute Hours | 1/day (shared) | Always-on | Use connection pooling |
| Concurrent Connections | 100 | 200+ | Implement connection pooler |
| Branches | 10 | Unlimited | Use main + preview only |

**Error Codes:**
- `53300`: Too many connections → Use pgBouncer
- `57014`: Query timeout → Optimize queries, add indexes
- `53400`: Configuration limit → Upgrade plan

**Fallback Strategy:**
```typescript
// Database connection fallback
if (dbConnection === 'failed') {
  // 1. Try read replica (if configured)
  // 2. Serve from Redis cache
  // 3. Show cached data with "offline" badge
  // 4. Queue writes to retry queue
}
```

### 3. Upstash Redis

| Limit Type | Free Tier | Pay-as-you-go | Our Strategy |
|------------|-----------|---------------|--------------|
| Daily Commands | 10,000 | Unlimited | Batch operations |
| Max Commands/sec | 1,000 | 1,000 | Implement rate limiting |
| Storage | 256MB | Unlimited | Use TTL aggressively |
| Concurrent Connections | 100 | 1,000 | Connection pooling |

**Error Codes:**
- `429`: Rate limit → Backoff and retry
- `507`: Storage full → Clear old cache
- `ERR max clients`: Too many connections → Pool connections

**Fallback Strategy:**
```typescript
// Redis fallback chain
if (redisDown) {
  // 1. Use in-memory cache (LRU, 100MB max)
  // 2. Skip cache, go direct to database
  // 3. Increase database connection pool
  // 4. Log cache misses for analysis
}
```

### 4. Resend Email

| Limit Type | Free Tier | Pro Tier | Our Strategy |
|------------|-----------|----------|--------------|
| Emails/month | 3,000 | 100,000 | Batch notifications |
| Emails/day | 100 | 10,000 | Queue and throttle |
| Rate limit | 10/second | 100/second | Implement queue |
| Attachment size | 10MB | 25MB | Use S3 links instead |

**Error Codes:**
- `429`: Rate limit → Queue for retry
- `402`: Quota exceeded → Critical emails only
- `503`: Service down → Fallback provider

**Fallback Strategy:**
```typescript
// Email fallback chain
if (resendFailed) {
  // 1. Add to retry queue (exponential backoff)
  // 2. For critical emails, try backup provider
  // 3. Log to database for manual send
  // 4. Show in-app notification instead
}
```

### 5. AWS S3

| Limit Type | Standard | Our Usage | Our Strategy |
|------------|----------|-----------|--------------|
| PUT requests | 3,500/sec | ~10/sec | No issue expected |
| GET requests | 5,500/sec | ~100/sec | Use CloudFront CDN |
| Storage | Pay-per-GB | ~50GB/month | Monitor costs |
| Bandwidth | Pay-per-GB | ~100GB/month | Use compression |

**Error Codes:**
- `503`: Slow down → Exponential backoff
- `403`: Access denied → Check IAM permissions
- `404`: Bucket not found → Verify configuration

**Fallback Strategy:**
```typescript
// S3 fallback strategy
if (s3Upload === 'failed') {
  // 1. Retry with exponential backoff (3 attempts)
  // 2. Store locally in /tmp (with cleanup)
  // 3. Queue for background upload
  // 4. Alert ops team if persistent
}
```

### 6. Vercel Platform

| Limit Type | Hobby | Pro | Our Strategy |
|------------|-------|-----|--------------|
| Bandwidth | 100GB/month | 1TB/month | Use CDN caching |
| Function executions | 100K/month | 1M/month | Optimize functions |
| Function duration | 10 seconds | 60 seconds | Use background jobs |
| Edge requests | 500K/month | Unlimited | Cache at edge |

**Error Codes:**
- `429`: Rate limit → Show static fallback
- `504`: Timeout → Optimize function
- `502`: Function error → Show error page

**Fallback Strategy:**
```typescript
// Vercel function fallback
if (functionTimeout) {
  // 1. Return partial results
  // 2. Move to background job
  // 3. Serve static fallback page
  // 4. Increase function memory/timeout
}
```

## Global Rate Limiting Strategy

### Implementation

```typescript
// lib/rateLimiter.ts
class RateLimiter {
  private limits = new Map<string, number>();
  
  async checkLimit(
    service: string,
    key: string,
    maxRequests: number,
    window: number
  ): Promise<boolean> {
    const cacheKey = `rate:${service}:${key}`;
    const current = await redis.incr(cacheKey);
    
    if (current === 1) {
      await redis.expire(cacheKey, window);
    }
    
    if (current > maxRequests) {
      // Log rate limit hit
      console.warn(`Rate limit hit: ${service} for ${key}`);
      return false;
    }
    
    return true;
  }
}
```

### Per-Service Limits

```typescript
// Service-specific rate limits
const RATE_LIMITS = {
  calculations: { requests: 100, window: 60 },    // 100/minute
  csvUpload: { requests: 10, window: 60 },        // 10/minute
  export: { requests: 5, window: 60 },            // 5/minute
  whatIf: { requests: 50, window: 60 },           // 50/minute
  peerComparison: { requests: 20, window: 60 },   // 20/minute
};
```

## Monitoring & Alerts

### Metrics to Track

1. **Rate Limit Approaches (80% threshold)**
   - Alert when any service hits 80% of rate limit
   - Dashboard showing current usage vs limits

2. **Service Availability**
   - Health checks every 30 seconds
   - Alert on 3 consecutive failures

3. **Fallback Activation**
   - Log every fallback trigger
   - Alert if fallback used >10 times/hour

### Alert Channels

```yaml
alerts:
  critical:
    - slack: "#platform-critical"
    - pagerduty: on-call
    - email: ops@assuredpartners.com
  
  warning:
    - slack: "#platform-alerts"
    - email: dev-team@assuredpartners.com
  
  info:
    - slack: "#platform-monitoring"
```

## Cost Optimization

### Service Costs at Scale

| Service | Free Tier | Estimated Monthly | Cost at 10x Scale |
|---------|-----------|-------------------|-------------------|
| Clerk | $0 | $0 (under 5K MAU) | $250 |
| Neon | $0 | $0 (under limits) | $100 |
| Upstash | $0 | $10 (pay-as-you-go) | $100 |
| Resend | $0 | $0 (under 3K) | $20 |
| S3 | $0 | $5 | $50 |
| Vercel | $0 | $20 (Pro) | $20 |
| **Total** | **$0** | **$35** | **$540** |

### Optimization Strategies

1. **Cache Aggressively**
   - Cache calculations for 5 minutes
   - Cache peer comparisons for 1 hour
   - Cache reports for 24 hours

2. **Batch Operations**
   - Batch email sends
   - Batch database writes
   - Batch S3 uploads

3. **Use Webhooks**
   - Replace polling with webhooks
   - Use Clerk webhooks for user events
   - Use S3 event notifications

## Emergency Procedures

### Service Outage Runbook

#### 1. Clerk Authentication Down
```bash
1. Verify at status.clerk.dev
2. Enable read-only mode
3. Serve cached sessions from Redis
4. Show maintenance banner
5. Queue new registrations
```

#### 2. Database Down
```bash
1. Check Neon status page
2. Switch to read-only mode
3. Serve from Redis cache
4. Queue writes to SQS/Redis
5. Alert customers via status page
```

#### 3. Multiple Services Down
```bash
1. Activate full maintenance mode
2. Serve static fallback pages
3. Queue all operations
4. Communicate via status page
5. Initiate incident response
```

## Testing Rate Limits

### Load Testing Script

```bash
# Test rate limits
npm run test:rate-limits

# Test specific service
npm run test:rate-limits -- --service=clerk

# Test failover
npm run test:failover -- --service=all
```

## Useful Commands

```bash
# Check current rate limit usage
npm run check:limits

# Reset rate limit counters (dev only)
npm run reset:limits

# View service health
npm run health:check

# Test fallback strategies
npm run test:fallbacks
```

---

**Last Updated:** January 2025
**Review Schedule:** Monthly
**Owner:** Platform Team