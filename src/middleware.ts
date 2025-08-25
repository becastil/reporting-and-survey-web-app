import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Always bypass auth in demo mode for MVP
  // Check for demo mode from multiple sources for reliability
  const isDemoMode = 
    process.env.DEMO_MODE === 'true' || 
    process.env.SKIP_AUTH === 'true' ||
    process.env.ENABLE_DEMO_MODE === 'true'
  
  if (isDemoMode) {
    return NextResponse.next()
  }

  // Only use Clerk in production with proper setup
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY) {
    try {
      const { authMiddleware } = require('@clerk/nextjs')
      return authMiddleware({})(request)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.next()
    }
  }

  // Default: allow access
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}