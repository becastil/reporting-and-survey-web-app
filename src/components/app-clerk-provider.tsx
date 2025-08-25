'use client'

import { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { clientEnv } from '@/lib/env'

interface AppClerkProviderProps {
  children: ReactNode
}

export function AppClerkProvider({ children }: AppClerkProviderProps) {
  // Allow demo bypass only in non-production
  const isDemoBypass =
    process.env.NODE_ENV !== 'production' &&
    (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      process.env.NEXT_PUBLIC_SKIP_AUTH === 'true' ||
      process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true')

  if (isDemoBypass) {
    return <>{children}</>
  }

  const pk = clientEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  if (!pk && process.env.NODE_ENV !== 'test') {
    throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY for ClerkProvider')
  }

  return <ClerkProvider publishableKey={pk}>{children}</ClerkProvider>
}

