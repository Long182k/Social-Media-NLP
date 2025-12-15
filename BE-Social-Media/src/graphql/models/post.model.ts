import { Field, ID, ObjectType, Int } from '@nestjs/graphql';
import { User } from './user.model';
import { Media } from './media.model';

@ObjectType()
export class PostCount {
  @Field(() => Int)
  likes: number;

  @Field(() => Int)
  comments: number;

  @Field(() => Int)
  bookmarks: number;
}

@ObjectType()
export class Post {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field()
  userId: string;

  @Field()
  sentiment: string;

  @Field()
  createdAt: Date;

  @Field(() => User)
  user: User;

  @Field(() => [Media], { nullable: true })
  attachments?: Media[];

  @Field(() => PostCount, {nullable: true})
  _count?: PostCount;
}

@ObjectType()
export class PostMeta {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType()
export class PostResponse {
  @Field(() => [Post])
  data: Post[];

  @Field(() => PostMeta)
  meta: PostMeta;
}

@ObjectType()
export class PostInteractionResponse {
  @Field({ nullable: true })
  liked?: boolean;

  @Field({ nullable: true })
  bookmarked?: boolean;
}

@ObjectType()
export class PostLikedEvent {
  @Field(() => ID)
  postId: string;

  @Field(() => ID)
  userId: string;

  @Field()
  liked: boolean;
}
