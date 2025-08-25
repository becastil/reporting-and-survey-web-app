# Project Setup Guide

## Prerequisites

### Required Software Versions
- **Node.js**: v20.9.0 or higher (LTS recommended)
- **npm**: v10.0.0 or higher
- **PostgreSQL**: v15+ (or use Neon cloud service)
- **Redis**: v7+ (or use Upstash cloud service)

### Version Management
We use `.nvmrc` to ensure consistent Node.js versions across the team:
```bash
# If using nvm (recommended)
nvm install
nvm use

# Verify versions
node --version  # Should show v20.9.0 or higher
npm --version   # Should show v10.0.0 or higher
```

## Initial Project Setup

### 1. Project Initialization Approach

This project was bootstrapped using:
```bash
npx create-next-app@14 survey-reporting-platform \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm
```

**Key Flags Explained:**
- `--typescript`: TypeScript configuration with strict mode
- `--tailwind`: Tailwind CSS with PostCSS configuration
- `--app`: Next.js 14 App Router (not Pages Router)
- `--src-dir`: Organized code in `src/` directory
- `--import-alias`: Path aliases for cleaner imports
- `--use-npm`: npm as package manager (not yarn/pnpm)

### 2. Monorepo Structure

```
survey-reporting-platform/
├── src/                    # Application source code
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── lib/              # Utilities and libraries
│   └── types/            # TypeScript type definitions
├── packages/              # Future monorepo packages
│   ├── shared/           # Shared types and utilities
│   ├── api/             # Backend API (future)
│   └── cli/             # CLI tools (future)
├── docs/                 # Documentation
├── tests/               # Test suites
└── scripts/             # Build and deployment scripts
```

### 3. Environment Setup

```bash
# 1. Clone the repository
git clone https://github.com/assured-partners/survey-web-app-version-2.git
cd survey-web-app-version-2

# 2. Install correct Node version
nvm install
nvm use

# 3. Install dependencies
npm install

# 4. Copy environment variables
cp .env.example .env.local

# 5. Configure environment variables
# Edit .env.local with your values:
# - DATABASE_URL (PostgreSQL connection)
# - REDIS_URL (Redis connection)
# - NEXT_PUBLIC_CLERK_* (Authentication keys)

# 6. Set up database
npm run db:push      # Push schema to database
npm run db:seed      # Seed initial data

# 7. Start development server
npm run dev
```

## Development Workflow

### Code Quality Scripts
```bash
npm run format        # Format code with Prettier
npm run format:check  # Check formatting (CI)
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run pre-commit   # Run all checks (for hooks)
```

### Database Management
```bash
npm run db:push      # Push schema changes
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:seed      # Seed data
npm run db:studio    # Open Drizzle Studio
```

## Platform Support

### Operating Systems
- ✅ macOS (primary development)
- ✅ Linux (CI/CD and production)
- ✅ Windows (via WSL2 recommended)

### Windows-Specific Setup
For Windows developers:
1. Use WSL2 for best compatibility
2. Or ensure Git autocrlf is set to `false`
3. Use PowerShell or Git Bash for scripts

### IDE Configuration
Recommended VS Code extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features
- Prisma (if using Prisma ORM)

## CI/CD Configuration

### GitHub Actions Node Version
Ensure `.github/workflows/ci.yml` matches:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version-file: '.nvmrc'
    cache: 'npm'
```

### Branch Protection Rules
Main branch protection settings:
- ✅ Require pull request reviews
- ✅ Require status checks (lint, type-check, test)
- ✅ Require branches to be up to date
- ✅ Include administrators
- ✅ Restrict force pushes

## Future Package Integration

When adding new packages to the monorepo:

### Backend API Package
```bash
# Future structure
packages/api/
├── src/
├── package.json
└── tsconfig.json
```

### Design System Package
```bash
# Future structure
packages/design-system/
├── components/
├── tokens/
├── package.json
└── tsconfig.json
```

### CLI Tools Package
```bash
# Future structure
packages/cli/
├── commands/
├── package.json
└── tsconfig.json
```

## Troubleshooting

### Common Issues

**Node Version Mismatch**
```bash
# Error: The engine "node" is incompatible...
# Solution:
nvm use
# Or install required version:
nvm install 20.9.0
```

**Database Connection Issues**
```bash
# Check PostgreSQL is running
psql --version
# Check Redis is running
redis-cli ping
```

**Port Conflicts**
```bash
# Next.js default port 3000 in use
# Solution: Use different port
PORT=3001 npm run dev
```

## Questions or Issues?

- Check existing issues: [GitHub Issues](https://github.com/assured-partners/survey-web-app-version-2/issues)
- Team Slack: #survey-platform-dev
- Technical Lead: @sarah (Product Owner)