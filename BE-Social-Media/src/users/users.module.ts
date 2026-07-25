import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import access_tokenJwtConfig from '../auth/@config/access_token-jwt.config';
import refresh_tokenJwtConfig from '../auth/@config/refresh_token-jwt.config';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma.service';
import { UsersController } from './users.controller';
import { UserRepository } from './users.repository';
import { UsersService } from './users.service';
import { CloudinaryService } from '../file/file.service';
import { MulterModule } from '@nestjs/platform-express';
import { FileModule } from '../file/file.module';
import { RedisModule } from '../redis/redis.module';
import { NotificationService } from '../notification/notification.service';

@Module({
  imports: [
    JwtModule.registerAsync(access_tokenJwtConfig.asProvider()),
    ConfigModule.forFeature(access_tokenJwtConfig),
    ConfigModule.forFeature(refresh_tokenJwtConfig),
    RedisModule,
    FileModule,
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  controllers: [UsersController],
  providers: [
    UserRepository,
    UsersService,
    PrismaService,
    AuthService,
    JwtService,
    NotificationService,
    CloudinaryService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
