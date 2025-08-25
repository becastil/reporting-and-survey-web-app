import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';
import { authMiddleware } from '@clerk/nextjs';
import { getServerEnv } from '@/lib/env';

const { DEMO_MODE, SKIP_AUTH, ENABLE_DEMO_MODE } = getServerEnv();
const isDemoMode = DEMO_MODE === 'true' || SKIP_AUTH === 'true' || ENABLE_DEMO_MODE === 'true';

const clerkMiddleware = authMiddleware({
  publicRoutes: ['/', '/sign-in(.*)', '/sign-up(.*)', '/api/public(.*)'],
});

export default function middleware(request: NextRequest, evt: NextFetchEvent) {
  if (isDemoMode) {
    return NextResponse.next();
  }

  return clerkMiddleware(request, evt);
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
