'use client'

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'

interface ConditionalClerkProviderProps {
  children: ReactNode
}

// Calculate at module level - env vars are available at build time
// This is safe because these env vars don't change at runtime
const shouldUseDemoMode = 
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
  process.env.NEXT_PUBLIC_SKIP_AUTH === 'true' ||
  process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' ||
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'pk_test_demo' ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'pk_test_dummy'

// Only load ClerkProvider if not in demo mode
// This prevents loading unnecessary chunks in demo mode
const ClerkProviderDynamic = shouldUseDemoMode ? null : dynamic(
  () => import('@clerk/nextjs').then((mod) => ({ 
    default: mod.ClerkProvider 
  })),
  { 
    ssr: false,
    loading: () => null // No loading state to prevent flashes
  }
)

export function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
  // If in demo mode or ClerkProvider not needed, render children directly
  // This provides consistent behavior between server and client
  if (!ClerkProviderDynamic) {
    return <>{children}</>
  }
  
  // Only render ClerkProvider when properly configured
  return <ClerkProviderDynamic>{children}</ClerkProviderDynamic>
}