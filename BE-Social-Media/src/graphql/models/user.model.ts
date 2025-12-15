import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  userName: string;

  @Field()
  nickName: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  coverPageUrl?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  dateOfBirth?: Date;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  createdAt?: Date;
}

@ObjectType()
export class UserFollowedEvent {
  @Field(() => ID)
  followerId: string;

  @Field(() => ID)
  followingId: string;

  @Field()
  isFollowing: boolean;

  @Field()
  followersCount: number;

  @Field()
  followingCount: number;
}
