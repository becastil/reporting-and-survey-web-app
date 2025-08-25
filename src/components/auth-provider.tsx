'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { ReactNode } from 'react'

// Check if we're in demo mode
const isDemoMode = 
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
  process.env.NEXT_PUBLIC_SKIP_AUTH === 'true' ||
  process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' ||
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // In demo mode or when Clerk is not configured, render children directly
  if (isDemoMode) {
    return <>{children}</>
  }

  // Only use ClerkProvider when properly configured
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  )
}