import { registerEnumType } from '@nestjs/graphql';
import { NotificationType } from '@prisma/client';

registerEnumType(NotificationType, {
  name: 'NotificationType', // This name will appear in your GraphQL schema
  description: 'Type of notification (e.g. FOLLOW, LIKE, COMMENT, etc.)',
});

export { NotificationType };
