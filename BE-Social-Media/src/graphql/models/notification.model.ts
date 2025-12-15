import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';
import { NotificationType } from '../../auth/util/@enum/notification.enum';


@ObjectType()
export class Notification {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field()
  senderId: string;

  @Field({ nullable: true })
  receiverId?: string;

  @Field()
  isRead: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => User, { nullable: true })
  sender?: User;

  @Field(() => User, { nullable: true })
  receiver?: User;
}
