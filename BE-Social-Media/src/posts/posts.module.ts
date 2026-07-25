import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from '../prisma.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import access_tokenJwtConfig from '../auth/config/access_token-jwt.config';
import refresh_tokenJwtConfig from '../auth/config/refresh_token-jwt.config';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { UserRepository } from '../users/users.repository';
import { InteractionsService } from './interactions.service';
import { CloudinaryService } from '../file/file.service';
import { NotificationService } from '../notification/notification.service';
import { NlpModule } from '../nlp/nlp.module';
import { RedisModule } from '../redis/redis.module';
import { UsersModule } from '../users/users.module';
import { GraphQLAppModule } from '../graphql/graphql.module';
import { PubSubService } from '../graphql/pubsub.service';

@Module({
  imports: [
    JwtModule.registerAsync(access_tokenJwtConfig.asProvider()),
    ConfigModule.forFeature(access_tokenJwtConfig),
    ConfigModule.forFeature(refresh_tokenJwtConfig),
    NlpModule,
    RedisModule,
    UsersModule,
    GraphQLAppModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PrismaService,
    AuthService,
    JwtService,
    CloudinaryService,
    InteractionsService,
    UsersService,
    UserRepository,
    NotificationService,
    PubSubService,
  ],
  exports: [GraphQLAppModule],
})
export class PostsModule {}
