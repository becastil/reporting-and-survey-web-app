import { serverEnv } from '@/lib/env'

// Validates required Clerk env in production; no-ops in other envs
export function assertClerkEnv() {
  if (process.env.NODE_ENV === 'production') {
    // Will throw with descriptive error if missing
    serverEnv()
  }
}

