// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.NODE_ENV = 'test';

// Mock fetch for tests
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      reload: jest.fn(),
      forward: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock Clerk authentication
jest.mock('@clerk/nextjs', () => ({
  auth: () => ({ userId: 'test-user-id' }),
  currentUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
  }),
  useAuth: () => ({
    userId: 'test-user-id',
    isSignedIn: true,
  }),
  useUser: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
    isSignedIn: true,
  }),
}));

// Performance API mock
global.performance = {
  now: jest.fn(() => Date.now()),
};