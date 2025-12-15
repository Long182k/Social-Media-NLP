import { Field, InputType, Int } from '@nestjs/graphql';
import { MediaInput } from './media.input';

@InputType()
export class CreatePostInput {
  @Field()
  content: string;

  @Field(() => [MediaInput], { nullable: true })
  attachments?: MediaInput[];
}

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  content?: string;

  @Field(() => [MediaInput], { nullable: true })
  attachments?: MediaInput[];
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 10 })
  limit: number;
}