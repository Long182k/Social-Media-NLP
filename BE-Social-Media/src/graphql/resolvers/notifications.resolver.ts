import {
  Args,
  ID,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { CurrentUser } from '../../auth/@decorator/current-user.decorator';
import { BookmarkService } from '../../bookmark/bookmark.service';
import { NotificationService } from '../../notification/notification.service';
import { CreateNotificationInput } from '../inputs/notification.input';
import { Notification } from '../models/notification.model';
import { PubSubService } from '../pubsub.service';

@Resolver(() => Notification)
export class NotificationsResolver {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly bookmarkService: BookmarkService,
    private readonly pubsubService: PubSubService,
  ) {}

  @Mutation(() => Notification)
  async createNotification(
    @Args('input') input: CreateNotificationInput,
    @CurrentUser('userId') userId: string,
  ): Promise<Notification> {
    const notification = await this.notificationService.create(input);

    // Publish the new notification for subscriptions
    this.pubsubService.publish('notificationCreated', {
      notificationCreated: notification,
    });

    return notification;
  }

  @Mutation(() => Notification)
  async toggleBookmarkNotification(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<Notification> {
    const notification = await this.bookmarkService.toggleBookmark(id, user);

    this.pubsubService.publish('notificationCreated', {
      notificationCreated: notification,
    });

    return notification;
  }

  @Query(() => [Notification])
  async notifications(
    @CurrentUser('userId') userId: string,
  ): Promise<Notification[]> {
    return await this.notificationService.findAll(userId);
  }

  @Mutation(() => Boolean)
  async deleteNotification(
    @CurrentUser('userId') userId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.notificationService.remove(userId, id);

    return true;
  }

  @Mutation(() => Notification)
  async markNotificationAsRead(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<Notification> {
    const notification = await this.notificationService.updateIsRead(
      userId,
      id,
    );

    // Publish notification update for subscriptions
    this.pubsubService.publish('notificationUpdated', {
      notificationUpdated: notification,
    });

    return notification;
  }

  @Subscription(() => Notification, {
    filter: (payload, variables, context) => {
      // Only send notifications to the receiver who listen to the event.
      if (!payload.notificationCreated) {
        return false;
      }

      const currentUserId = context.req?.user?.userId || context.req?.user?.id;
      if (!currentUserId) {
        // console.log('No current user found in context');
        return false;
      }

      const shouldReceive =
        payload.notificationCreated.receiverId === currentUserId;
      // console.log('Subscription filter - Current user:', currentUserId);
      // console.log(
      //   'Subscription filter - Notification receiver:',
      //   payload.notificationCreated.receiverId,
      // );
      // console.log('Subscription filter - Should receive:', shouldReceive);
      return shouldReceive;
    },
  })
  notificationCreated() {
    return this.pubsubService.asyncIterableIterator('notificationCreated');
  }

  @Subscription(() => Notification)
  notificationUpdated() {
    return this.pubsubService.asyncIterableIterator('notificationUpdated');
  }
}
