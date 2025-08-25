import { ReactNode } from 'react'
import dynamic from 'next/dynamic'

// Check if we're in demo mode or Clerk is not properly configured
const isDemoMode = 
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
  process.env.NEXT_PUBLIC_SKIP_AUTH === 'true' ||
  process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' ||
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'pk_test_demo' ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'pk_test_dummy'

interface ConditionalClerkProviderProps {
  children: ReactNode
}

// Only import ClerkProvider if not in demo mode
const ClerkProviderWrapper = !isDemoMode
  ? dynamic(
      () =>
        import('@clerk/nextjs').then((mod) => {
          const ClerkProvider = mod.ClerkProvider
          return function ClerkWrapper({ children }: { children: ReactNode }) {
            return <ClerkProvider>{children}</ClerkProvider>
          }
        }),
      { ssr: false }
    )
  : null

export function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
  if (!isDemoMode && ClerkProviderWrapper) {
    return <ClerkProviderWrapper>{children}</ClerkProviderWrapper>
  }
  
  return <>{children}</>
}