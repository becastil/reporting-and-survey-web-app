// Single source of truth for public routes
// These routes do not require authentication
export const publicRoutes = [
  '/',
  '/favicon.ico',
  '/_next/static/*',
  '/_next/image*',
  // Add any public API routes explicitly here, e.g. health checks
  '/api/health',
]
