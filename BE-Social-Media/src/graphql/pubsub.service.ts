// pubsub.service.ts
import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class PubSubService {
  private readonly pubSub: PubSub;

  constructor() {
    this.pubSub = new PubSub();
  }

  async publish(triggerName: string, payload: any): Promise<boolean> {
    await this.pubSub.publish(triggerName, payload);
    return true;
  }

  asyncIterableIterator(triggerName: string) {
    return this.pubSub.asyncIterableIterator(triggerName);
  }
}
