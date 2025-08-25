import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authMiddleware } from '@clerk/nextjs'
import { publicRoutes } from '@/config/publicRoutes'

export default function middleware(request: NextRequest) {
  // Allow demo bypass only in non-production
  const isDemoBypass =
    process.env.NODE_ENV !== 'production' &&
    (process.env.DEMO_MODE === 'true' ||
      process.env.SKIP_AUTH === 'true' ||
      process.env.ENABLE_DEMO_MODE === 'true')

  if (isDemoBypass) return NextResponse.next()

  return authMiddleware({ publicRoutes })(request)
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/api/(.*)'],
}
