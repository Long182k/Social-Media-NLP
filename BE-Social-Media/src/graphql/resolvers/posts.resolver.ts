import { UploadedFiles } from '@nestjs/common';
import {
  Args,
  ID,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorator/current-user.decorator';
import { InteractionsService } from '../../posts/interactions.service';
import { PostsService } from '../../posts/posts.service';
import {
  CreatePostInput,
  PaginationInput,
  UpdatePostInput,
} from '../inputs/post.input';
import { Notification } from '../models/notification.model';
import {
  Post,
  PostInteractionResponse,
  PostResponse,
} from '../models/post.model';
import { PubSubService } from '../pubsub.service';

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly interactionsService: InteractionsService,
    private readonly pubSub: PubSubService,
  ) {}

  @Query(() => PostResponse)
  async posts(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PostResponse> {
    const paginationDto = pagination || { page: 1, limit: 10 };
    return this.postsService.findAll(paginationDto);
  }

  @Query(() => Post)
  async post(@Args('id', { type: () => ID }) id: string): Promise<Post> {
    return this.postsService.findOne(id);
  }

  @Mutation(() => Post)
  async createPost(
    @CurrentUser('userId') userId: string,
    @Args('input') input: CreatePostInput,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Post> {
    const post = await this.postsService.create(userId, input, files);

    // Publish the new post for subscriptions
    this.pubSub.publish('postCreated', { postCreated: post });

    return post;
  }

  @Mutation(() => Post)
  async updatePost(
    @CurrentUser('userId') userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePostInput,
  ): Promise<Post> {
    return this.postsService.update(id, userId, input);
  }

  @Mutation(() => Boolean)
  async deletePost(
    @CurrentUser('userId') userId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.postsService.remove(id, userId);
    return true;
  }

  @Mutation(() => PostInteractionResponse)
  async likePost(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<PostInteractionResponse> {
    const result = await this.interactionsService.toggleLike(id, user);

    // Publish the like action for subscriptions
    this.pubSub.publish('postLiked', {
      postLiked: result,
    });

    return result;
  }

  @Subscription(() => Post)
  postCreated() {
    return this.pubSub.asyncIterableIterator('postCreated');
  }

  @Subscription(() => Notification, {
    filter: (payload, variables, context) => {
      if (!payload.postLiked) {
        return false;
      }

      const currentUserId = context.req?.user?.userId || context.req?.user?.id;
      if (!currentUserId) {
        // console.log('No current user found in context');
        return false;
      }

      const shouldReceive = payload.postLiked.receiverId === currentUserId;
      // console.log('Subscription filter - Current user:', currentUserId);
      // console.log(
      //   'Subscription filter - Notification receiver:',
      //   payload.postLiked.receiverId,
      // );
      // console.log('Subscription filter - Should receive:', shouldReceive);
      return shouldReceive;
    },
  })
  postLiked() {
    return this.pubSub.asyncIterableIterator('postLiked');
  }
}
