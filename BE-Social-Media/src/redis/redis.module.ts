import { Module } from '@nestjs/common';
import Redis from 'ioredis';
import Redlock from 'redlock';
import 'dotenv/config';

const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    // Add error handling for connection issues
    const redis = new Redis({
      host:
        process.env.IS_PRODUCTION === 'true'
          ? process.env.REDIS_HOST
          : '127.0.0.1',
      port:
        process.env.IS_PRODUCTION === 'true'
          ? Number(process.env.REDIS_PORT)
          : 6379,
      // Add reconnect strategy
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    return redis;
  },
};

const redlockProvider = {
  provide: 'REDLOCK',
  inject: ['REDIS_CLIENT'],
  useFactory: (redis: Redis) =>
    new Redlock([redis], {
      retryCount: 5,
      retryDelay: 500, // ms
      retryJitter: 100, // randomize retry
    }),
};

@Module({
  providers: [redisProvider, redlockProvider],
  exports: ['REDIS_CLIENT', 'REDLOCK'],
})
export class RedisModule {}
