import {
  Args,
  ID,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { CurrentUser } from 'src/auth/@decorator/current-user.decorator';
import { UsersService } from '../../users/users.service';
import { User, UserFollowedEvent } from '../models/user.model';

const pubSub = new PubSub();

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  async users(@CurrentUser('userId') userId: string): Promise<User[]> {
    return this.usersService.findAll(userId);
  }

  @Query(() => User)
  async user(@Args('id', { type: () => ID }) id: string): Promise<User> {
    const user = await this.usersService.findUserByKeyword({ id });
    return user[0];
  }

  @Query(() => User)
  async me(@CurrentUser('userId') userId: string): Promise<User> {
    const users = await this.usersService.findUserByKeyword({
      id: userId,
    });
    return users[0];
  }

  @Mutation(() => User)
  async updateAvatar(
    @Args('avatarUrl') avatarUrl: string,
    @CurrentUser('userId') userId: string,
  ): Promise<User> {
    return this.usersService.updateAvatar(userId, avatarUrl);
  }

  @Mutation(() => User)
  async updateCoverPage(
    @Args('coverPageUrl') coverPageUrl: string,
    @CurrentUser('userId') userId: string,
  ): Promise<User> {
    return this.usersService.updateCoverPage(userId, coverPageUrl);
  }

  @Mutation(() => Boolean)
  async followUser(
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser('userId') currentUserId: string,
  ): Promise<boolean> {
    const result = await this.usersService.followUser(currentUserId, userId);

    // Publish follow event for subscriptions
    pubSub.publish('userFollowed', {
      userFollowed: {
        followerId: currentUserId,
        followingId: userId,
        isFollowing: result.isFollowing,
        followersCount: result.followersCount,
        followingCount: result.followingCount,
      },
    });

    return result.isFollowing;
  }

  @Subscription(() => UserFollowedEvent)
  userFollowed() {
    return pubSub.asyncIterableIterator('userFollowed');
  }
}
