// Mock all dependencies before importing the controller
jest.mock(
  'src/auth/guard/local-auth.guard',
  () => ({
    LocalAuthGuard: class LocalAuthGuardMock {},
  }),
  { virtual: true },
);

jest.mock(
  'src/auth/guard/jwt-auth.guard',
  () => ({
    JwtAuthGuard: class JwtAuthGuardMock {},
  }),
  { virtual: true },
);

jest.mock(
  'src/auth/guard/refresh-auth.guard',
  () => ({
    RefreshAuthGuard: class RefreshAuthGuardMock {},
  }),
  { virtual: true },
);

jest.mock(
  'src/auth/decorator/public.decorator',
  () => ({
    Public: () => () => {},
    IS_PUBLIC_KEY: 'IS_PUBLIC_KEY',
  }),
  { virtual: true },
);

jest.mock(
  'src/auth/decorator/current-user.decorator',
  () => ({
    CurrentUser: () => () => {},
  }),
  { virtual: true },
);

jest.mock(
  'src/auth/decorator/refreshToken.decorator',
  () => ({
    RefreshToken: () => () => {},
    IS_REFRESH_TOKEN_KEY: 'IS_REFRESH_TOKEN_KEY',
  }),
  { virtual: true },
);

jest.mock(
  'src/users/dto/create-user.dto',
  () => ({
    CreateUserDTO: class CreateUserDTOMock {},
  }),
  { virtual: true },
);

// Mock the exact paths that are imported in the services using path aliases
jest.mock('src/prisma.service');
jest.mock('src/users/users.repository');
jest.mock('src/users/users.service');
jest.mock('@nestjs-modules/mailer');
jest.mock('ioredis');
jest.mock('./config/refresh_token-jwt.config');

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { UserRepository } from '../users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigType } from '@nestjs/config';
import refreshTokenJwtConfig from './config/refresh_token-jwt.config';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    createUser: jest.fn(),
    login: jest.fn(),
    signOut: jest.fn(),
    getUserById: jest.fn(),
    changePassword: jest.fn(),
    forgotPassword: jest.fn(),
    rotateRefreshToken: jest.fn(),
  } as unknown as jest.Mocked<AuthService>;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            $connect: jest.fn(),
            $disconnect: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findUserByKeyword: jest.fn(),
            updateHashedRefreshToken: jest.fn(),
            findAll: jest.fn(),
            findAvailableContact: jest.fn(),
            findOne: jest.fn(),
            editProfile: jest.fn(),
            updateAvatar: jest.fn(),
            updateCoverPage: jest.fn(),
            remove: jest.fn(),
            followUser: jest.fn(),
            getFollowStatus: jest.fn(),
            getFollowers: jest.fn(),
            getFollowing: jest.fn(),
            getSuggestedUsers: jest.fn(),
            getRecentBirthdayUsers: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            createUser: jest.fn(),
            findUserByKeyword: jest.fn(),
            updateHashedRefreshToken: jest.fn(),
            findAllUsers: jest.fn(),
            findUserByEmail: jest.fn(),
            update: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: refreshTokenJwtConfig.KEY,
          useValue: {
            secret: 'test-secret',
            expiresIn: '7d',
          } as ConfigType<typeof refreshTokenJwtConfig>,
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(
      AuthService,
    ) as jest.Mocked<AuthService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create (register)', () => {
    it('delegates to AuthService.createUser and returns result', async () => {
      const dto = {
        userName: 'alice',
        email: 'alice@example.com',
        password: 'pass',
      } as any;

      authService.createUser.mockResolvedValue({
        id: 'u1',
        userName: 'alice',
      } as any);

      const result = await controller.create(dto);

      expect(authService.createUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'u1', userName: 'alice' });
    });
  });

  describe('login', () => {
    it('sets refreshToken cookie and returns login info without refreshToken', async () => {
      const res = {
        cookie: jest.fn(),
      } as any;

      const user = { id: 'u1', userName: 'alice' } as any;

      const loginInfo = {
        accessToken: 'access',
        refreshToken: 'refresh',
        userId: 'u1',
        userName: 'alice',
        nickName: 'Alice',
        email: 'alice@example.com',
        role: 'USER',
        avatarUrl: 'http://avatar',
        coverPageUrl: 'http://cover',
      };

      authService.login.mockResolvedValue({ ...loginInfo });

      const result = await controller.login(user);

      expect(authService.login).toHaveBeenCalledWith(user);
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });

      // refreshToken must not be part of the returned body
      expect(result).toEqual({
        accessToken: 'access',
        userId: 'u1',
        userName: 'alice',
        nickName: 'Alice',
        email: 'alice@example.com',
        role: 'USER',
        avatarUrl: 'http://avatar',
        coverPageUrl: 'http://cover',
      });
      expect((result as any).refreshToken).toBeUndefined();
    });
  });

  describe('refresh', () => {
    it('sets new refresh token cookie and returns accessToken from user.newTokens', async () => {
      const res = {
        cookie: jest.fn(),
      } as any;

      // Simulate request-scoped user set by RefreshAuthGuard strategy
      const user = {
        newTokens: {
          accessToken: 'new_access',
          refreshToken: 'new_refresh',
        },
      };

      const result = await controller.refresh(res, user as any);

      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'new_refresh', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      expect(result).toEqual({ accessToken: 'new_access' });
    });
  });

  describe('signOut', () => {
    it('reads refreshToken cookie and delegates to AuthService.signOut', async () => {
      const req = {
        cookies: { refreshToken: 'rt_value' },
      } as any;
      const res = {
        clearCookie: jest.fn(),
      } as any;

      authService.signOut.mockResolvedValue({
        message: 'Sign out successfully',
      } as any);

      const result = await controller.signOut(req, res, {});

      expect(authService.signOut).toHaveBeenCalledWith('rt_value', res);
      expect(result).toEqual({ message: 'Sign out successfully' });
    });

    it('passes null when cookie is missing', async () => {
      const req = {
        cookies: undefined,
      } as any;
      const res = {
        clearCookie: jest.fn(),
      } as any;

      authService.signOut.mockResolvedValue({
        message: 'Sign out successfully',
      } as any);

      const result = await controller.signOut(req, res, {});

      expect(authService.signOut).toHaveBeenCalledWith(null, res);
      expect(result).toEqual({ message: 'Sign out successfully' });
    });
  });

  describe('getProfile', () => {
    it('returns req.user', () => {
      const req = { user: { id: 'u1', role: 'USER' } } as any;

      expect(controller.getProfile(req)).toEqual({ id: 'u1', role: 'USER' });
    });
  });

  describe('getProfileById', () => {
    it('delegates to AuthService.getUserById', async () => {
      authService.getUserById.mockResolvedValue({ id: 'u1' } as any);

      const result = await controller.getProfileById('u1');

      expect(authService.getUserById).toHaveBeenCalledWith('u1');
      expect(result).toEqual({ id: 'u1' });
    });
  });

  describe('changePassword', () => {
    it('delegates to AuthService.changePassword with req.user.userId', async () => {
      const req = { user: { userId: 'u1' } } as any;
      const dto = { oldPassword: 'old', newPassword: 'new' } as any;

      authService.changePassword.mockResolvedValue({ id: 'u1' } as any);

      const result = await controller.changePassword(req, dto);

      expect(authService.changePassword).toHaveBeenCalledWith('u1', dto);
      expect(result).toEqual({ id: 'u1' });
    });
  });

  describe('forgotPassword', () => {
    it('delegates to AuthService.forgotPassword with provided email', async () => {
      const dto = { email: 'alice@example.com' } as any;

      authService.forgotPassword.mockResolvedValue({
        message: 'Password reset instructions have been sent to your email',
      } as any);

      const result = await controller.forgotPassword(dto);

      expect(authService.forgotPassword).toHaveBeenCalledWith(
        'alice@example.com',
      );
      expect(result).toEqual({
        message: 'Password reset instructions have been sent to your email',
      });
    });
  });
});
