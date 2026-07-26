import { Field, InputType } from '@nestjs/graphql';
import { MediaType } from '@prisma/client';

@InputType()
export class MediaInput {
  @Field()
  type: MediaType;

  @Field()
  url: string;
}
