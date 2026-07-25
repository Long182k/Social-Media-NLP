import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PostsResolver } from './resolvers/posts.resolver';

import { NotificationsResolver } from './resolvers/notifications.resolver';
import { PrismaService } from '../prisma.service';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
import { NotificationService } from '../notification/notification.service';
import { UserRepository } from '../users/users.repository';
import { CloudinaryService } from '../file/file.service';
import { NlpService } from '../nlp/nlp.service';
import { InteractionsService } from '../posts/interactions.service';
import { UsersResolver } from './resolvers/users.resolver';
import { RedisModule } from '../redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import access_tokenJwtConfig from '../auth/config/access_token-jwt.config';
import { BookmarkService } from '../bookmark/bookmark.service';
import { PubSubService } from './pubsub.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/api/graphql',
      autoSchemaFile: true,
      sortSchema: true,
      playground: true,
      subscriptions: {
        'graphql-ws': true,
      },
      context: ({ req, connection }) => {
        // For subscriptions, connection.connectionParams will contain the connection parameters
        if (connection) {
          // Extract the authorization token from connectionParams
          const authHeader =
            connection.connectionParams?.Authorization ||
            connection.connectionParams?.authorization;

          // Create a proper request object for subscriptions with the auth header
          return {
            req: {
              headers: {
                authorization: authHeader,
              },
              user: null,
            },
          };
        }
        // For queries and mutations, req will be available
        return { req };
      },
    }),
    RedisModule,
    JwtModule.registerAsync(access_tokenJwtConfig.asProvider()),
  ],
  providers: [
    PrismaService,
    PostsService,
    UsersService,
    NotificationService,
    UserRepository,
    CloudinaryService,
    NlpService,
    InteractionsService,
    BookmarkService,
    PubSubService,
    PostsResolver,
    UsersResolver,
    NotificationsResolver,
  ],
  exports: [PubSubService],
})
export class GraphQLAppModule {}
