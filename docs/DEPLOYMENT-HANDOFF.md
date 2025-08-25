# Deployment & Handoff Checklist

## Document Purpose
This comprehensive checklist ensures smooth transition from development to production deployment and operational handoff to the support team.

## Pre-Deployment Validation

### Code Quality Gates ✅
- [ ] All tests passing: `npm run test:all`
- [ ] Type checking clean: `npm run type-check`
- [ ] Linting passed: `npm run lint`
- [ ] Build successful: `npm run build`
- [ ] Bundle size < 500KB: `npm run analyze`
- [ ] No console.log statements in production code
- [ ] No hardcoded secrets or API keys
- [ ] All TODOs addressed or documented

### Security Audit ✅
- [ ] Dependencies updated: `npm audit fix`
- [ ] No high/critical vulnerabilities
- [ ] Environment variables documented
- [ ] CORS policies configured
- [ ] Rate limiting enabled
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

### Performance Validation ✅
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing
- [ ] API response times < 200ms
- [ ] Database queries optimized
- [ ] Images optimized and lazy-loaded
- [ ] Code splitting implemented
- [ ] Cache headers configured
- [ ] CDN configured

## Infrastructure Setup

### Environment Configuration
```bash
# Production Environment Variables
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379
NEXT_PUBLIC_API_URL=https://api.assuredpartners.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
SENDGRID_API_KEY=SG.xxx
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
AWS_S3_BUCKET=assuredpartners-prod
SENTRY_DSN=https://xxx@sentry.io/xxx
POSTHOG_API_KEY=phc_xxx
```

### Database Migration
```bash
# 1. Backup existing data
pg_dump production_db > backup_$(date +%Y%m%d).sql

# 2. Run migrations
npm run db:migrate:prod

# 3. Verify schema
npm run db:verify

# 4. Load initial data
npm run db:seed:prod

# 5. Test connectivity
npm run db:health
```

### Redis Setup
```bash
# 1. Clear development cache
redis-cli FLUSHALL

# 2. Configure production settings
redis-cli CONFIG SET maxmemory 2gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# 3. Test connection
redis-cli PING

# 4. Monitor memory usage
redis-cli INFO memory
```

## Deployment Process

### Vercel Deployment
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Link project
vercel link

# 4. Deploy to preview
vercel

# 5. Run smoke tests on preview URL
npm run test:e2e -- --base-url=https://preview-xxx.vercel.app

# 6. Deploy to production
vercel --prod

# 7. Verify deployment
curl -I https://assuredpartners.vercel.app
```

### Post-Deployment Verification
- [ ] Homepage loads successfully
- [ ] Authentication works
- [ ] CSV upload processes
- [ ] Calculations return correct results
- [ ] What-If modeling updates
- [ ] Export generation works
- [ ] Email notifications sent
- [ ] Error tracking connected
- [ ] Analytics firing

## Monitoring Setup

### Application Monitoring
```javascript
// Sentry Configuration
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Scrub sensitive data
    return event;
  },
});

// PostHog Analytics
posthog.init(process.env.POSTHOG_API_KEY, {
  api_host: 'https://app.posthog.com',
  loaded: () => console.log('PostHog loaded'),
});
```

### Health Checks
```typescript
// /api/health endpoint
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    storage: await checkS3(),
    email: await checkEmail(),
  };
  
  const healthy = Object.values(checks).every(c => c.status === 'ok');
  
  return NextResponse.json({
    status: healthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  });
}
```

### Alerting Rules
```yaml
# PagerDuty Alert Configuration
alerts:
  - name: API Response Time
    condition: p95 > 500ms
    severity: warning
    
  - name: Error Rate
    condition: error_rate > 1%
    severity: critical
    
  - name: Database Connection
    condition: connection_pool < 10%
    severity: critical
    
  - name: Memory Usage
    condition: memory > 90%
    severity: warning
```

## Documentation Handoff

### Technical Documentation ✅
- [x] Architecture diagram updated
- [x] API documentation complete
- [x] Database schema documented
- [x] Deployment runbook created
- [x] Troubleshooting guide written
- [x] Performance tuning guide
- [x] Security best practices
- [x] Backup/restore procedures

### Operational Documentation ✅
- [x] User manual created
- [x] Admin guide complete
- [x] FAQ documented
- [x] Video tutorials recorded
- [x] Release notes prepared
- [x] Known issues documented
- [x] Support escalation paths
- [x] SLA definitions

## Team Handoff

### Knowledge Transfer Sessions
- [ ] Architecture walkthrough (2 hours)
- [ ] Code structure review (1 hour)
- [ ] Deployment process training (1 hour)
- [ ] Monitoring and alerting (1 hour)
- [ ] Common issues and fixes (1 hour)
- [ ] Q&A session (1 hour)

### Access Provisioning
- [ ] GitHub repository access
- [ ] Vercel dashboard access
- [ ] Database credentials (via 1Password)
- [ ] Redis access
- [ ] AWS console access
- [ ] Monitoring dashboards
- [ ] Error tracking access
- [ ] Analytics access

### Support Materials
```markdown
## Quick Reference Card

### Common Commands
- Start local dev: `npm run dev`
- Run tests: `npm run test`
- Deploy preview: `vercel`
- Deploy production: `vercel --prod`
- View logs: `vercel logs`
- Database migration: `npm run db:migrate`
- Clear cache: `npm run cache:clear`

### Important URLs
- Production: https://app.assuredpartners.com
- Staging: https://staging.assuredpartners.com
- API Docs: https://api.assuredpartners.com/docs
- Status Page: https://status.assuredpartners.com
- Admin Panel: https://app.assuredpartners.com/admin

### Emergency Contacts
- On-call Engineer: (555) 123-4567
- DevOps Lead: devops@assuredpartners.com
- Database Admin: dba@assuredpartners.com
- Security Team: security@assuredpartners.com
```

## Go-Live Checklist

### 24 Hours Before
- [ ] Final code freeze
- [ ] Complete regression testing
- [ ] Update DNS settings (TTL to 300s)
- [ ] Notify stakeholders
- [ ] Prepare rollback plan
- [ ] Schedule team availability

### 1 Hour Before
- [ ] Database backup completed
- [ ] Monitoring dashboards open
- [ ] Communication channels ready
- [ ] Load balancer configured
- [ ] Feature flags reviewed
- [ ] Team briefing complete

### Go-Live Sequence
1. [ ] Enable maintenance mode
2. [ ] Deploy to production
3. [ ] Run smoke tests
4. [ ] Verify health checks
5. [ ] Gradual traffic migration (10% → 50% → 100%)
6. [ ] Monitor error rates
7. [ ] Disable maintenance mode
8. [ ] Announce success

### Post Go-Live (First 24 Hours)
- [ ] Monitor error rates hourly
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Address critical issues
- [ ] Update status page
- [ ] Document lessons learned

## Rollback Plan

### Automatic Rollback Triggers
- Error rate > 5%
- Response time > 1000ms
- Database connection failures
- Memory usage > 95%

### Manual Rollback Process
```bash
# 1. Switch to maintenance mode
vercel alias set maintenance.assuredpartners.com

# 2. Revert deployment
vercel rollback

# 3. Verify rollback
curl -I https://app.assuredpartners.com

# 4. Clear cache
npm run cache:clear:prod

# 5. Notify stakeholders
npm run notify:rollback
```

## Success Criteria

### Technical Metrics
- [ ] 99.9% uptime achieved
- [ ] < 200ms average response time
- [ ] < 0.1% error rate
- [ ] > 90 Lighthouse score
- [ ] Zero security vulnerabilities

### Business Metrics
- [ ] User adoption > 80%
- [ ] Support tickets < 10/week
- [ ] Customer satisfaction > 4.5/5
- [ ] Demo conversion > 50%
- [ ] ROI demonstrated within 30 days

## Sign-Off

### Deployment Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Engineering Lead | ___________ | _______ | _____ |
| QA Lead | ___________ | _______ | _____ |
| Product Owner | ___________ | _______ | _____ |
| DevOps Lead | ___________ | _______ | _____ |
| Security Lead | ___________ | _______ | _____ |
| Support Lead | ___________ | _______ | _____ |

## Post-Deployment Review

### 7-Day Review
- [ ] Performance metrics analyzed
- [ ] User feedback collected
- [ ] Issues prioritized
- [ ] Improvements identified
- [ ] Documentation updated
- [ ] Team retrospective completed

### 30-Day Review
- [ ] Success metrics evaluated
- [ ] ROI calculated
- [ ] Scaling needs assessed
- [ ] Feature roadmap updated
- [ ] Team feedback incorporated
- [ ] Lessons learned documented

---

**Document Owner:** DevOps Team
**Last Updated:** January 2025
**Version:** 1.0.0
**Next Review:** Post-deployment