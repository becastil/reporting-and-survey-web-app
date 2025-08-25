import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // In demo mode or when Clerk is not properly configured, bypass authentication
  if (process.env.DEMO_MODE === 'true' || process.env.SKIP_AUTH === 'true') {
    return NextResponse.next()
  }

  // For production with proper Clerk setup
  try {
    const { authMiddleware } = require('@clerk/nextjs')
    return authMiddleware({})(request)
  } catch (error) {
    console.error('Auth middleware error:', error)
    // Fallback to allowing access if auth fails
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}