'use client'

import { ReactNode, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

interface ConditionalClerkProviderProps {
  children: ReactNode
}

// Dynamically import ClerkProvider only when needed
const ClerkProviderDynamic = dynamic(
  () => import('@clerk/nextjs').then((mod) => ({ 
    default: mod.ClerkProvider 
  })),
  { 
    ssr: false,
    loading: () => null
  }
)

export function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
  const [isDemoMode, setIsDemoMode] = useState(true) // Default to demo mode to prevent errors
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Check demo mode on client side only
    const checkDemoMode = 
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
      process.env.NEXT_PUBLIC_SKIP_AUTH === 'true' ||
      process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' ||
      !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'pk_test_demo' ||
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'pk_test_dummy'
    
    setIsDemoMode(checkDemoMode)
    setIsClient(true)
  }, [])

  // During SSR or in demo mode, render children directly
  if (!isClient || isDemoMode) {
    return <>{children}</>
  }

  // Only use ClerkProvider on client when not in demo mode
  return <ClerkProviderDynamic>{children}</ClerkProviderDynamic>
}