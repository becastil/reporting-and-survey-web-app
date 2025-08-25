# Developer Onboarding Checklist

Welcome to the Assured Partners Survey & Reporting Platform! This guide will walk you through setting up all required services and your development environment.

## 🚀 Quick Start Timeline
**Total Setup Time: ~2 hours**
- Service Accounts: 45 minutes
- Local Environment: 30 minutes
- Database Setup: 20 minutes
- Verification: 25 minutes

## 📋 Prerequisites Checklist

- [ ] Node.js 20.9.0+ installed (use `nvm install` if you have nvm)
- [ ] Git configured with SSH keys for GitHub
- [ ] Code editor installed (VS Code recommended)
- [ ] PostgreSQL client installed (for local development)
- [ ] Redis installed locally OR Docker Desktop for containers

## 🔑 Step 1: External Service Accounts (45 min)

### Required Services Priority Order

#### 1.1 Vercel Account (5 min) - REQUIRED
**Purpose:** Deployment platform for frontend and API
1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended) or email
3. **No credit card required for hobby tier**
4. Note your username for team invites

#### 1.2 Clerk Authentication (10 min) - REQUIRED
**Purpose:** User authentication and session management
1. Visit https://clerk.com and click "Get Started"
2. Create account with GitHub OAuth (recommended)
3. Create new application:
   - Name: "Survey Platform Dev"
   - Select "Next.js" as framework
4. From dashboard, get your keys:
   - Publishable Key (starts with `pk_test_`)
   - Secret Key (starts with `sk_test_`)
5. **Free tier:** 5,000 monthly active users
6. **Rate limits:** 100 requests/second

**Known Issues:**
- Clerk requires domain verification for production
- Test mode keys only work on localhost and Vercel preview URLs

#### 1.3 Neon Database (10 min) - REQUIRED
**Purpose:** Serverless PostgreSQL database
1. Sign up at https://neon.tech
2. Create account with GitHub or Google
3. Create new project:
   - Project name: "survey-platform"
   - Region: US East (Ohio) - closest to Vercel
   - PostgreSQL version: 15
4. Copy connection string from dashboard
5. **Free tier:** 3GB storage, 1 compute hour/day
6. **Connection limit:** 100 concurrent connections

**Setup Commands:**
```bash
# Test connection (replace with your connection string)
psql "postgresql://user:pass@ep-example.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

#### 1.4 Upstash Redis (10 min) - REQUIRED
**Purpose:** Serverless Redis for caching
1. Register at https://upstash.com
2. Create account with GitHub
3. Create new Redis database:
   - Name: "survey-cache"
   - Region: US-East-1
   - Enable "Eviction"
4. From database details, copy:
   - REST URL
   - REST Token
5. **Free tier:** 10,000 commands/day, 256MB
6. **Rate limit:** 1000 commands/second

#### 1.5 Resend Email Service (5 min) - REQUIRED
**Purpose:** Transactional emails and notifications
1. Sign up at https://resend.com
2. Verify your email address
3. Create API key:
   - Name: "survey-platform-dev"
   - Permission: "Full Access"
4. Add and verify sending domain (or use onboarding@resend.dev for testing)
5. **Free tier:** 3,000 emails/month, 100/day
6. **Rate limit:** 10 emails/second

#### 1.6 AWS S3 Storage (10 min) - OPTIONAL for MVP
**Purpose:** CSV file storage
1. Sign in to AWS Console: https://aws.amazon.com
2. Navigate to S3 service
3. Create new bucket:
   - Name: "survey-platform-uploads-dev"
   - Region: us-east-1
   - Block all public access: Yes
4. Create IAM user for programmatic access:
   - Go to IAM → Users → Add User
   - Username: "survey-platform-s3"
   - Access type: Programmatic access
5. Attach policy: "AmazonS3FullAccess" (for dev only)
6. Save Access Key ID and Secret Access Key
7. **Free tier:** 5GB storage, 20,000 GET requests
8. **Pricing:** ~$0.023/GB/month after free tier

**Bucket CORS Configuration:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://*.vercel.app"],
    "ExposeHeaders": ["ETag"]
  }
]
```

#### 1.7 Sentry Error Monitoring (5 min) - RECOMMENDED
**Purpose:** Error tracking and performance monitoring
1. Sign up at https://sentry.io
2. Create new project:
   - Platform: Next.js
   - Project name: "survey-platform"
3. Copy DSN from project settings
4. **Free tier:** 5,000 errors/month
5. **Rate limit:** 50 events/second

## 🔧 Step 2: Environment Configuration (15 min)

### 2.1 Create Local Environment File
```bash
# Copy the example file
cp .env.example .env.local
```

### 2.2 Fill in Service Credentials

Edit `.env.local` with your actual values:

```bash
# Database Configuration
# Instructions: Copy from Neon dashboard → Connection Details → Connection string
DATABASE_URL="postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Redis Configuration
# Instructions: Copy from Upstash dashboard → REST API section
UPSTASH_REDIS_REST_URL="https://us1-example-12345.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AX3aASQgN..."

# Authentication (Clerk)
# Instructions: Copy from Clerk dashboard → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
# These URLs are pre-configured, don't change unless customizing
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Email Service (Resend)
# Instructions: Copy from Resend dashboard → API Keys
RESEND_API_KEY="re_..."
EMAIL_FROM="notifications@yourdomain.com" # or "onboarding@resend.dev" for testing

# File Storage (AWS S3) - Optional for MVP
# Instructions: From IAM user credentials (Step 1.6)
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="survey-platform-uploads-dev"

# Performance Monitoring (Sentry) - Optional
# Instructions: Copy from Sentry → Settings → Client Keys (DSN)
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="..." # From Settings → Auth Tokens

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## 🗄️ Step 3: Database Setup (20 min)

```bash
# 1. Install dependencies
npm install

# 2. Push database schema to Neon
npm run db:push

# 3. Seed initial data
npm run db:seed

# 4. Verify with Drizzle Studio
npm run db:studio
# Opens at http://localhost:4983
```

## ✅ Step 4: Verification (25 min)

### 4.1 Test Each Service

```bash
# 1. Start development server
npm run dev

# 2. Check health endpoint
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "redis": "connected",
    "auth": "configured",
    "email": "configured",
    "storage": "configured"
  }
}
```

### 4.2 Service-Specific Tests

#### Test Clerk Auth:
1. Navigate to http://localhost:3000/sign-up
2. Create test account
3. Verify redirect to dashboard

#### Test Email (Resend):
```bash
# Run email test script
npm run test:email
```

#### Test Redis Cache:
```bash
# Run cache test
npm run test:cache
```

#### Test S3 Upload (if configured):
```bash
# Run storage test
npm run test:storage
```

## 🚨 Common Issues & Solutions

### Issue: "Invalid DATABASE_URL"
**Solution:** Ensure you copied the entire connection string including `?sslmode=require`

### Issue: "Clerk publishable key not found"
**Solution:** Keys must start with `pk_test_` for development

### Issue: "Redis connection refused"
**Solution:** Check UPSTASH_REDIS_REST_URL starts with `https://`

### Issue: "Email sending failed"
**Solution:** Verify domain or use `onboarding@resend.dev` for testing

### Issue: "S3 Access Denied"
**Solution:** Check IAM user has S3FullAccess policy attached

## 📊 Service Limits & Fallbacks

| Service | Free Tier Limits | Rate Limits | Fallback Strategy |
|---------|-----------------|-------------|-------------------|
| Clerk | 5K MAU | 100 req/s | Show maintenance page |
| Neon | 3GB, 1 compute hr/day | 100 connections | Read-only mode |
| Upstash | 10K commands/day | 1000 cmd/s | Skip cache, direct DB |
| Resend | 3K emails/month | 10/second | Queue for retry |
| S3 | 5GB storage | No hard limit | Local temp storage |
| Sentry | 5K errors/month | 50 events/s | Log to console |
| Vercel | 100GB bandwidth | 12 functions/min | Static fallback |

## 🎯 Next Steps

1. Join team Slack channel: #survey-platform-dev
2. Review architecture docs: `/docs/architecture.md`
3. Check PRD for feature context: `/docs/prd.md`
4. Run the test suite: `npm test`
5. Try the demo mode: `npm run dev` → Click "Start Demo"

## 🆘 Getting Help

- **Slack:** #survey-platform-dev
- **Wiki:** https://github.com/assured-partners/survey-platform/wiki
- **Issues:** https://github.com/assured-partners/survey-platform/issues
- **Team Contacts:**
  - Technical Lead: @sarah (Product Owner)
  - DevOps: @winston (Architect)
  - QA: @quinn (QA Lead)

---

**Time to First Commit: ~2 hours**
**Time to Production Deploy: ~3 hours**

Welcome to the team! 🎉