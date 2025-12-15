import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class MediaInput {
  @Field()
  type: 'image' | 'video';

  @Field()
  url: string;
}
