import { Redis } from '@upstash/redis';

// Redis client configuration with fallback to local Redis
const getRedisClient = () => {
  // Production: Use Upstash Redis
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return Redis.fromEnv();
  }
  
  // Development: Use local Redis or mock
  if (process.env.NODE_ENV === 'development') {
    console.warn('Using local Redis configuration. Set UPSTASH_* env vars for production.');
    
    // If local Redis URL is provided
    if (process.env.REDIS_URL) {
      return new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:8079', // Local Upstash mock
        token: process.env.UPSTASH_REDIS_REST_TOKEN || 'mock_token',
      });
    }
  }
  
  // Test environment: Use mock Redis
  if (process.env.NODE_ENV === 'test') {
    return {
      get: async () => null,
      set: async () => 'OK',
      del: async () => 1,
      exists: async () => 0,
      expire: async () => 1,
      ttl: async () => -1,
      mget: async () => [],
      mset: async () => 'OK',
      hget: async () => null,
      hset: async () => 1,
      hdel: async () => 1,
      hgetall: async () => ({}),
      zadd: async () => 1,
      zrange: async () => [],
      zrem: async () => 1,
      pipeline: () => ({
        exec: async () => [],
      }),
    } as any;
  }
  
  throw new Error(
    'Redis configuration missing. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.'
  );
};

export const redis = getRedisClient();

// Cache utilities with performance tracking
export class CacheManager {
  private static readonly DEFAULT_TTL = 60 * 60; // 1 hour in seconds
  private static readonly CACHE_VERSION = 'v1';
  
  static getCacheKey(...parts: string[]): string {
    return [this.CACHE_VERSION, ...parts].join(':');
  }
  
  static async get<T>(key: string): Promise<T | null> {
    const start = performance.now();
    try {
      const cached = await redis.get(key);
      const duration = performance.now() - start;
      
      if (cached) {
        console.log(`Cache HIT for ${key} (${duration.toFixed(2)}ms)`);
      } else {
        console.log(`Cache MISS for ${key} (${duration.toFixed(2)}ms)`);
      }
      
      return cached as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  static async set<T>(
    key: string, 
    value: T, 
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    const start = performance.now();
    try {
      await redis.set(key, JSON.stringify(value), { ex: ttl });
      const duration = performance.now() - start;
      console.log(`Cache SET for ${key} (${duration.toFixed(2)}ms)`);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  static async invalidate(pattern: string): Promise<void> {
    // In production, you might want to use Redis SCAN
    // For now, we'll invalidate specific keys
    try {
      await redis.del(pattern);
      console.log(`Cache invalidated: ${pattern}`);
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
  
  // Performance-critical calculation caching
  static async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<{ data: T; fromCache: boolean; computeTime?: number }> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached) {
      return { data: cached, fromCache: true };
    }
    
    // Compute if not cached
    const start = performance.now();
    const data = await computeFn();
    const computeTime = performance.now() - start;
    
    // Cache the result
    await this.set(key, data, ttl);
    
    return { data, fromCache: false, computeTime };
  }
}

// What-If calculation cache for sub-50ms performance
export class WhatIfCache {
  static async getCachedCalculation(params: {
    orgId: string;
    employeeAdjustment: number;
    rebateOffset?: number;
  }): Promise<any> {
    const key = CacheManager.getCacheKey(
      'whatif',
      params.orgId,
      params.employeeAdjustment.toString(),
      (params.rebateOffset || 0).toString()
    );
    
    return CacheManager.getOrCompute(
      key,
      async () => {
        // This would be replaced with actual calculation
        // Placeholder for demonstration
        return {
          originalPepm: 500,
          adjustedPepm: 500 * (1 + params.employeeAdjustment / 100),
          variance: 500 * (params.employeeAdjustment / 100),
          calculationTime: 42, // Our target!
        };
      },
      300 // 5 minute TTL for what-if calculations
    );
  }
}