import { Field, InputType } from '@nestjs/graphql';
import { NotificationType } from '../../auth/util/enum/notification.enum';

@InputType()
export class CreateNotificationInput {
  @Field()
  content: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field()
  senderId: string;

  @Field()
  receiverId: string;
}
