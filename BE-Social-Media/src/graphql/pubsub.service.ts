// pubsub.service.ts
import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

@Injectable()
export class PubSubService {
  private readonly pubSub: PubSub | RedisPubSub;

  constructor() {
    const redisUrl = process.env.REDIS_URL;

    if (redisUrl) {
      const connection = new Redis(redisUrl, {
        lazyConnect: false,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: true,
        retryStrategy: (times) =>
          times > 5 ? null : Math.min(times * 200, 2000),
      });
      connection.on('error', (err) => {
        if ((err as any)?.code !== 'ECONNREFUSED') {
          console.error(
            'RedisPubSub connection error:',
            err?.message || err,
          );
        }
      });
      this.pubSub = new RedisPubSub({
        publisher: connection,
        subscriber: connection,
      });
    } else {
      this.pubSub = new PubSub();
    }
  }

  async publish(triggerName: string, payload: any): Promise<boolean> {
    if (this.pubSub instanceof RedisPubSub) {
      await this.pubSub.publish(triggerName, payload);
    } else {
      await this.pubSub.publish(triggerName, payload);
    }
    return true;
  }

  asyncIterableIterator(triggerName: string) {
    return this.pubSub.asyncIterableIterator(triggerName);
  }
}
