# Survey & Reporting Platform

A modern, production-ready survey and reporting platform built with Next.js 14, TypeScript, and Tailwind CSS.

[![CI](https://github.com/becastil/reporting-and-survey-web-app/actions/workflows/ci.yml/badge.svg)](https://github.com/becastil/reporting-and-survey-web-app/actions/workflows/ci.yml)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/becastil/reporting-and-survey-web-app)

## 🚀 Quick Start

Get the app running locally in under 5 minutes:

```bash
# Clone the repository
git clone https://github.com/becastil/reporting-and-survey-web-app.git
cd reporting-and-survey-web-app

# Copy environment variables
cp .env.example .env.local

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Demo Mode

To run the app without authentication (demo mode), set these in `.env.local`:

```env
DEMO_MODE=true
SKIP_AUTH=true
```

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm 10.0.0 or higher
- PostgreSQL (optional, for full functionality)
- Redis (optional, for caching)

## 🛠️ Environment Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure required variables:**
   - **Database**: Update `DATABASE_URL` with your PostgreSQL connection
   - **Authentication**: Get Clerk keys from [clerk.dev](https://clerk.dev) or use demo mode
   - **Application URL**: Update `NEXT_PUBLIC_APP_URL` for production

3. **Optional services:**
   - Redis for caching (set `REDIS_URL`)
   - Feature flags (adjust `ENABLE_*` variables)

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production application |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Run TypeScript type checking |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run test:e2e` | Run end-to-end tests |

### Database Scripts

| Script | Description |
|--------|-------------|
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate database migrations |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Drizzle Studio |

## 🏗️ Project Structure

```
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── reporting/    # Reporting components
│   │   ├── survey/       # Survey components
│   │   └── ui/          # Shared UI components
│   ├── lib/             # Utility libraries
│   ├── config/          # Configuration files
│   └── middleware.ts    # Next.js middleware
├── docs/                # Documentation
├── e2e/                 # End-to-end tests
├── .github/            # GitHub Actions workflows
└── public/             # Static assets
```

## 🔑 Clerk Authentication

- Provider: The app is wrapped with `ClerkProvider` in `src/app/layout.tsx` via `src/components/app-clerk-provider.tsx`.
- Env inputs:
  - Server-only: `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
  - Client-only: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (same publishable key; safe for browser).
- No legacy Clerk variables are used (e.g., no `CLERK_FRONTEND_API`).
- Fail-fast: In production, startup fails with a clear error if keys are missing.

## 🧭 Environment Handling

- Centralized in `src/lib/env.ts` with Zod validation.
- Server code uses `serverEnv()` to access `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
- Client code imports `clientEnv` to access `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` only.
- Guardrails:
  - Server must not import `NEXT_PUBLIC_*` directly.
  - Client must never access `CLERK_SECRET_KEY`.
- Escape hatch: `SKIP_ENV_VALIDATION=true` can be set for local builds (non-production) to unblock development; never set this in production.

## 🛡️ Middleware & Public Routes

- Clerk middleware is enabled in `src/middleware.ts`.
- Public routes are defined in `src/config/publicRoutes.ts` and include:
  - `/`, `/favicon.ico`, `/_next/static/*`, `/_next/image*`, `/api/health`
- All other routes are protected by default.
- Demo bypass in middleware only applies in non-production (see Demo Mode below).

## 🧪 Health Check

- Endpoint: `GET /api/health` returns `{ status: 'ok' }`.
- Purpose: Simple readiness check for Vercel deployments and monitors.

## 🚀 Deployment

### Vercel (Recommended)

1. **Click the Deploy button:**
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/becastil/reporting-and-survey-web-app)

2. **Configure environment variables in Vercel:**
   - Add all variables from `.env.example`
   - Set `NODE_ENV=production`
   - Configure your database and authentication

3. **Deploy:**
   ```bash
   vercel --prod
   ```
4. **Smoke test:**
   - `GET https://<your-app>.vercel.app/api/health` → 200 `{ status: 'ok' }`.
   - Visit `/` → 200 unauthenticated (public).
   - Visit a protected route (e.g., `/survey`) → redirect/401 when signed out; renders when signed in.
   - `GET https://<your-app>.vercel.app/api/whoami` → 401 when signed out; 200 with user info when signed in.

## 🔐 Production Setup

- Required environment variables (Production):
  - `CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (same publishable key, used by client)
- Where to set them: Vercel → Project → Settings → Environment Variables → Production.
- Verification:
  - Deploy and check logs for absence of “@clerk/backend: Missing publishableKey”.
  - Visit a public route (e.g., `/`) and confirm it loads without auth.
  - Visit a protected route and confirm it redirects/401 when signed out and renders when signed in.
- Public routes are centrally defined in `src/config/publicRoutes.ts`. All other routes are protected via Clerk middleware.
 - Health check: `GET /api/health`.

## ✅ Vercel Deployment Checklist

- Set `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in Production.
- Ensure demo flags (`DEMO_MODE`, `SKIP_AUTH`, `ENABLE_DEMO_MODE`) are NOT enabled in Production.
- Redeploy with a clean build (`vercel --prod`).
- Smoke test public and protected routes as above.
 - Confirm logs show no “@clerk/backend: Missing publishableKey”.

## 🧪 Test Plan (Clerk)

### Local
- Copy `.env.example` → `.env.local` and provide real Clerk values for:
  - `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- Run `npm run dev` and verify:
  - Public pages load without auth; protected pages enforce auth (unless local Demo Mode is enabled).
  - Client bundle does not contain secrets: `grep -R "CLERK_SECRET_KEY" .next/static` → no results.

### Production (Vercel)
- Set the three Clerk env vars in Production.
- Ensure demo flags are disabled in Production.
- Deploy, then verify:
  - No “Missing publishableKey” in runtime logs.
  - `/api/health` → 200.
  - `/api/whoami` → 401 when signed out; 200 with user info when signed in.
  - Public and protected routes behave as expected when signed out/in.

## 🧪 Demo Mode (Local Only)

- Optional flags for local demos: `DEMO_MODE=true`, `SKIP_AUTH=true`, `ENABLE_DEMO_MODE=true`.
- Demo bypass is honored only in non-production.
- Do not enable these in Vercel Production.

## 🧪 Test Plan

### Local
- Copy `.env.example` → `.env.local` and provide real Clerk values for:
  - `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- Run `npm run dev` and verify:
  - Server components can access user state (when protected) via middleware.
  - Client components get user state via `ClerkProvider`.
  - No secret variables leak in client: `grep -R "CLERK_SECRET_KEY" .next/static` returns no results.

### Production (Vercel)
- Confirm middleware protects non-public routes and public routes load unauthenticated.
- Confirm no “Missing publishableKey” logs during runtime.

### Manual Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Start the server:**
   ```bash
   npm start
   ```

## 🧪 Testing

### Unit Tests
```bash
npm test                 # Run once
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage
```

### End-to-End Tests
```bash
npm run test:e2e        # Headless
npm run test:e2e:ui     # With UI
npm run test:e2e:debug  # Debug mode
```

## 🐛 Troubleshooting

### Common Issues

**Build fails with TypeScript errors:**
- Run `npm run type-check` to identify issues
- Temporarily skip with `SKIP_ENV_VALIDATION=true npm run build`

**Authentication not working:**
- Verify Clerk keys are correct
- Use `DEMO_MODE=true` for local development
- Check `NEXT_PUBLIC_APP_URL` matches your domain

**Database connection issues:**
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check network/firewall settings

**Module not found errors:**
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`

## 🔧 Development Workflow

1. **Create a new branch:**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and test:**
   ```bash
   npm run dev       # Development server
   npm test          # Run tests
   npm run lint      # Check linting
   ```

3. **Commit with conventional commits:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push and create PR:**
   ```bash
   git push origin feature/your-feature
   ```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📞 Support

- [GitHub Issues](https://github.com/becastil/reporting-and-survey-web-app/issues)
- [Documentation](./docs)

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
