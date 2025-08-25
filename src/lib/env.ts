import { z } from 'zod';

const clientSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_DEMO_MODE: z.string().optional(),
  NEXT_PUBLIC_SKIP_AUTH: z.string().optional(),
  NEXT_PUBLIC_ENABLE_DEMO_MODE: z.string().optional(),
});

export const env = clientSchema.parse({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE,
  NEXT_PUBLIC_SKIP_AUTH: process.env.NEXT_PUBLIC_SKIP_AUTH,
  NEXT_PUBLIC_ENABLE_DEMO_MODE: process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE,
});

const serverSchema = z.object({
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  DEMO_MODE: z.string().optional(),
  SKIP_AUTH: z.string().optional(),
  ENABLE_DEMO_MODE: z.string().optional(),
});

type ServerEnv = z.infer<typeof serverSchema>;

export const getServerEnv = (): ServerEnv => {
  const raw = {
    CLERK_PUBLISHABLE_KEY: process.env['CLERK_PUBLISHABLE_KEY'],
    CLERK_SECRET_KEY: process.env['CLERK_SECRET_KEY'],
    DEMO_MODE: process.env['DEMO_MODE'],
    SKIP_AUTH: process.env['SKIP_AUTH'],
    ENABLE_DEMO_MODE: process.env['ENABLE_DEMO_MODE'],
  };

  const parsed = serverSchema.safeParse(raw);
  if (!parsed.success && process.env.NODE_ENV !== 'test') {
    throw new Error('Missing or invalid server environment variables');
  }

  return parsed.data as ServerEnv;
};
