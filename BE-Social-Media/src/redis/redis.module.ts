import { Module } from '@nestjs/common';
import Redis from 'ioredis';
import Redlock from 'redlock';
import 'dotenv/config';

const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    const isVercelOrProd =
      process.env.VERCEL === '1' ||
      process.env.NODE_ENV === 'production' ||
      process.env.IS_PRODUCTION === 'true';

    const redisHost = process.env.REDIS_HOST;
    const redisUrl = process.env.REDIS_URL;

    // In production/Vercel without configured Redis host/url, disable network connection cleanly
    if (isVercelOrProd && !redisHost && !redisUrl) {
      const mockRedis: any = {
        get: async () => null,
        set: async () => 'OK',
        del: async () => 1,
        on: () => mockRedis,
        status: 'ready',
      };
      return mockRedis;
    }

    const redis = redisUrl
      ? new Redis(redisUrl, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          retryStrategy: (times) => (times > 2 ? null : 100),
        })
      : new Redis({
          host: redisHost || '127.0.0.1',
          port: Number(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          retryStrategy: (times) => (times > 2 ? null : 100),
        });

    redis.on('error', (err) => {
      if ((err as any)?.code !== 'ECONNREFUSED') {
        console.error('Redis connection error:', err);
      }
    });

    return redis;
  },
};

const redlockProvider = {
  provide: 'REDLOCK',
  inject: ['REDIS_CLIENT'],
  useFactory: (redis: any) => {
    if (!redis || typeof redis.eval !== 'function') {
      return {
        acquire: async () => ({
          release: async () => {},
        }),
        using: async (resources: any, ttl: number, routine: any) => {
          return routine();
        },
      };
    }
    return new Redlock([redis], {
      retryCount: 5,
      retryDelay: 500,
      retryJitter: 100,
    });
  },
};

@Module({
  providers: [redisProvider, redlockProvider],
  exports: ['REDIS_CLIENT', 'REDLOCK'],
})
export class RedisModule {}
