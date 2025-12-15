import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from 'src/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import access_tokenJwtConfig from 'src/auth/@config/access_token-jwt.config';
import refresh_tokenJwtConfig from 'src/auth/@config/refresh_token-jwt.config';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { UserRepository } from 'src/users/users.repository';
import { InteractionsService } from './interactions.service';
import { CloudinaryService } from 'src/file/file.service';
import { NotificationService } from 'src/notification/notification.service';
import { NlpModule } from '../nlp/nlp.module';
import { RedisModule } from 'src/redis/redis.module';
import { UsersModule } from 'src/users/users.module';
import { GraphQLAppModule } from 'src/graphql/graphql.module';
import { PubSubService } from 'src/graphql/pubsub.service';

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
