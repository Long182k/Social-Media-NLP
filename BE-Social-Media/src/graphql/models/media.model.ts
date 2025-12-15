import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Media {
  @Field(() => ID)
  id: string;

  @Field()
  type: string;

  @Field()
  url: string;

  @Field({ nullable: true })
  postId?: string;

  @Field()
  createdAt: Date;
}