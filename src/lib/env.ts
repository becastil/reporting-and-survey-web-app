// Centralized, type-safe environment access for server and client
// Guardrails:
// - Server code must never import NEXT_PUBLIC_* directly
// - Client code must never import or reference CLERK_SECRET_KEY

import { z } from 'zod'

const IS_TEST = process.env.NODE_ENV === 'test'
const IS_PROD = process.env.NODE_ENV === 'production'
const SKIP_VALIDATION = !IS_PROD && process.env.SKIP_ENV_VALIDATION === 'true'

// Server-side schema (secrets must exist in production)
const ServerSchema = z.object({
  CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'CLERK_PUBLISHABLE_KEY is required. Set it in your environment.'),
  CLERK_SECRET_KEY: z
    .string()
    .min(1, 'CLERK_SECRET_KEY is required. Set it in your environment.'),
})

// Client-side schema (only NEXT_PUBLIC_* are allowed)
const ClientSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required by client code.'),
})

type ServerEnv = z.infer<typeof ServerSchema>
type ClientEnv = z.infer<typeof ClientSchema>

function validateOrFallback<T extends z.ZodTypeAny>(schema: T, values: unknown): z.infer<T> {
  if (IS_TEST || SKIP_VALIDATION) {
    // In tests or when explicitly skipped (non-production only),
    // do a best-effort parse that allows empties.
    const shape = Object.fromEntries(Object.keys(values as any).map((k) => [k, (values as any)[k] ?? '']))
    return { ...(shape as any) }
  }
  const parsed = schema.safeParse(values)
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join('; ')
    throw new Error(`Environment validation failed: ${message}`)
  }
  return parsed.data
}

// Function, not constant, to ensure server-only access and avoid bundling in client
export function serverEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('serverEnv() must not be called on the client')
  }
  return validateOrFallback(ServerSchema, {
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  })
}

// Safe subset for client bundles (only NEXT_PUBLIC_* keys)
export const clientEnv: ClientEnv = (() => {
  const values = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '',
  }
  if (!IS_TEST && !SKIP_VALIDATION) {
    // Validate in non-test environments when not explicitly skipped
    validateOrFallback(ClientSchema, values)
  }
  return values
})()
