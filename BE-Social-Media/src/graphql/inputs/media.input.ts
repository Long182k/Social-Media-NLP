import { Field, InputType } from '@nestjs/graphql';
import { MediaType } from '@prisma/client';

@InputType()
export class MediaInput {
  @Field(() => String)
  type: MediaType;

  @Field()
  url: string;
}
