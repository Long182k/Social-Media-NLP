jest.mock(
  'src/prisma.service',
  () => {
    class PrismaService {
      user = {
        findUnique: jest.fn(),
        update: jest.fn(),
      };
    }
    return { PrismaService };
  },
  { virtual: true },
);

jest.mock(
  'src/users/users.repository',
  () => {
    class UserRepository {
      createUser = jest.fn();
    }
    return { UserRepository };
  },
  { virtual: true },
);

// argon2 global mock
jest.mock('argon2', () => ({
  verify: jest.fn(),
  hash: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

import * as argon from 'argon2';

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { UserRepository } from '../users/users.repository';
import refreshTokenJwtConfig from './@config/refresh_token-jwt.config';

describe('AuthService', () => {
  let service: AuthService;

  // Mocks used as provider values
  const jwtServiceMock = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const usersServiceMock = {
    findUserByKeyword: jest.fn(),
  };

  const userRepositoryMock = {
    createUser: jest.fn(),
  };

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mailerServiceMock = {
    sendMail: jest.fn(),
  };

  const redisMock = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const refreshTokenConfigMock: any = {
    secret: 'refresh_secret',
    signOptions: { expiresIn: '7d' },
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    process.env.LOGIN_LIMIT = '5';
    process.env.LOGIN_LIMIT_DURATION = '60';
    process.env.REFRESH_JWT_EXPIRED_TIME = '604800';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: UserRepository, useValue: userRepositoryMock },
        { provide: MailerService, useValue: mailerServiceMock },
        {
          provide: refreshTokenJwtConfig.KEY,
          useValue: refreshTokenConfigMock,
        },
        { provide: 'REDIS_CLIENT', useValue: redisMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const baseUser = {
      id: 'u1',
      userName: 'alice',
      email: 'alice@example.com',
      hashedPassword: 'hashed',
      isActive: true,
    };

    it('returns user without hashedPassword when credentials are valid', async () => {
      usersServiceMock.findUserByKeyword.mockResolvedValue(baseUser);
      (argon.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('alice', 'password');

      expect(result).toMatchObject({
        id: 'u1',
        userName: 'alice',
        email: 'alice@example.com',
      });
      expect((result as any).hashedPassword).toBeUndefined();
    });

    it('throws UnauthorizedException and records login attempt when invalid password', async () => {
      usersServiceMock.findUserByKeyword.mockResolvedValue(baseUser);
      (argon.verify as jest.Mock).mockResolvedValue(false);
      redisMock.get.mockResolvedValue(null);
      redisMock.set.mockResolvedValue('OK');

      await expect(
        service.validateUser('alice', 'wrong'),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(redisMock.set).toHaveBeenCalledWith(
        `login_attempts:${baseUser.email}`,
        1,
        'EX',
        Number(process.env.LOGIN_LIMIT_DURATION),
      );
    });

    it('throws UnauthorizedException when user is not active', async () => {
      usersServiceMock.findUserByKeyword.mockResolvedValue({
        ...baseUser,
        isActive: false,
      });

      await expect(
        service.validateUser('alice', 'password'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('returns tokens and stores refresh token in Redis', async () => {
      const user = {
        id: 'u1',
        userName: 'alice',
        nickName: 'Alice',
        email: 'alice@example.com',
        role: 'USER',
        avatarUrl: 'http://avatar',
        coverPageUrl: 'http://cover',
      };

      jwtServiceMock.signAsync
        .mockResolvedValueOnce('access_token')
        .mockResolvedValueOnce('refresh_token');

      redisMock.set.mockResolvedValue('OK');

      const result = await service.login(user);

      expect(result).toMatchObject({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        userId: 'u1',
        userName: 'alice',
        email: 'alice@example.com',
      });

      expect(redisMock.set).toHaveBeenCalledWith(
        expect.stringMatching(/^refresh:u1:/),
        expect.any(String),
        'EX',
        Number(process.env.REFRESH_JWT_EXPIRED_TIME),
      );
    });
  });

  describe('rotateRefreshToken', () => {
    it('revokes old RT, creates and stores new RT, returns new tokens', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({
        userId: 'u1',
        jti: 'old-jti',
      });

      redisMock.get.mockResolvedValue('old-jti');

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u1',
        userName: 'alice',
        nickName: 'Alice',
        email: 'alice@example.com',
        role: 'USER',
      });

      jwtServiceMock.signAsync
        .mockResolvedValueOnce('new_access')
        .mockResolvedValueOnce('new_refresh');

      redisMock.del.mockResolvedValue(1);
      redisMock.set.mockResolvedValue('OK');

      const result = await service.rotateRefreshToken('old_refresh_token');

      expect(redisMock.del).toHaveBeenCalledWith('refresh:u1:old-jti');
      expect(redisMock.set).toHaveBeenCalledWith(
        expect.stringMatching(/^refresh:u1:/),
        expect.any(String),
        'EX',
        Number(process.env.REFRESH_JWT_EXPIRED_TIME),
      );
      expect(result).toEqual({
        accessToken: 'new_access',
        refreshToken: 'new_refresh',
      });
    });

    it('throws UnauthorizedException when RT is not valid in Redis', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({
        userId: 'u1',
        jti: 'old-jti',
      });
      // Old RT not found
      redisMock.get.mockResolvedValue(null);

      await expect(
        service.rotateRefreshToken('bad_token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    // Cover verifyRefreshToken catch path (jwt verify fails)
    it('throws UnauthorizedException when jwtService.verifyAsync rejects', async () => {
      jwtServiceMock.verifyAsync.mockRejectedValue(new Error('invalid'));
      await expect(service.rotateRefreshToken('bad_rt')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('validateRefreshToken', () => {
    it('returns user id when refresh token matches', async () => {
      usersServiceMock.findUserByKeyword.mockResolvedValue({
        id: 'u1',
        hashedRefreshToken: 'stored_hash',
      });
      (argon.verify as jest.Mock).mockResolvedValue(true);

      await expect(service.validateRefreshToken('u1', 'rt')).resolves.toEqual({
        id: 'u1',
      });
    });

    it('throws UnauthorizedException when token mismatches', async () => {
      usersServiceMock.findUserByKeyword.mockResolvedValue({
        id: 'u1',
        hashedRefreshToken: 'stored_hash',
      });
      (argon.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateRefreshToken('u1', 'rt'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when no hashed RT exists', async () => {
      usersServiceMock.findUserByKeyword.mockResolvedValue({
        id: 'u1',
        hashedRefreshToken: null,
      });

      await expect(
        service.validateRefreshToken('u1', 'rt'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('validateJWTUser', () => {
    it('returns user info when user exists with hashedRefreshToken', async () => {
      usersServiceMock.findUserByKeyword.mockResolvedValue({
        id: 'u1',
        userName: 'alice',
        email: 'alice@example.com',
        role: 'USER',
        hashedRefreshToken: 'hash',
      });

      await expect(service.validateJWTUser('u1')).resolves.toEqual({
        userId: 'u1',
        userName: 'alice',
        role: 'USER',
        email: 'alice@example.com',
      });
    });

    it('throws UnauthorizedException when user not found or missing hashedRefreshToken', async () => {
      usersServiceMock.findUserByKeyword.mockResolvedValue({
        id: 'u1',
        userName: 'alice',
        email: 'alice@example.com',
        role: 'USER',
        hashedRefreshToken: null,
      });

      await expect(service.validateJWTUser('u1')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('changePassword', () => {
    it('updates password when current is valid', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u1',
        hashedPassword: 'old_hash',
      });
      (argon.verify as jest.Mock).mockResolvedValue(true);
      (argon.hash as jest.Mock).mockResolvedValue('new_hash');
      prismaMock.user.update.mockResolvedValue({ id: 'u1' });

      await service.changePassword('u1', {
        oldPassword: 'old',
        newPassword: 'new',
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { hashedPassword: 'new_hash' },
      });
    });

    it('throws UnauthorizedException when current password is incorrect', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u1',
        hashedPassword: 'old_hash',
      });
      (argon.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('u1', { oldPassword: 'x', newPassword: 'y' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('updates password and sends email when user exists', async () => {
      usersServiceMock.findUserByKeyword.mockResolvedValue({
        id: 'u1',
        userName: 'alice',
        email: 'alice@example.com',
      });
      (argon.hash as jest.Mock).mockResolvedValue('new_hash');
      prismaMock.user.update.mockResolvedValue({ id: 'u1' });
      mailerServiceMock.sendMail.mockResolvedValue(true);

      const result = await service.forgotPassword('alice@example.com');

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { email: 'alice@example.com' },
        data: { hashedPassword: 'new_hash' },
      });
      expect(mailerServiceMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'alice@example.com',
          subject: expect.stringContaining('Password Reset'),
        }),
      );
      expect(result).toEqual({
        message: 'Password reset instructions have been sent to your email',
      });
    });

    it('throws NotFoundException when user does not exist', async () => {
      usersServiceMock.findUserByKeyword.mockResolvedValue(null);

      await expect(
        service.forgotPassword('missing@example.com'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('createUser', () => {
    it('creates user, generates tokens, and returns merged result', async () => {
      const dto = {
        id: 'u2',
        userName: 'bob',
        nickName: 'Bob',
        email: 'bob@example.com',
        role: 'USER',
      } as any;

      jwtServiceMock.signAsync
        .mockResolvedValueOnce('access_from_createUser')
        .mockResolvedValueOnce('refresh_from_createUser');

      userRepositoryMock.createUser.mockResolvedValue({
        id: 'u2',
        userName: 'bob',
      });

      const result = await service.createUser(dto);

      expect(userRepositoryMock.createUser).toHaveBeenCalledWith(dto);
      expect(result).toMatchObject({
        id: 'u2',
        userName: 'bob',
        accessToken: 'access_from_createUser',
        refreshToken: 'refresh_from_createUser',
      });
    });
  });

  describe('rotateRefreshToken', () => {
    it('returns new access and refresh tokens for a user', async () => {
      const user = {
        id: 'u1',
        userName: 'alice',
        nickName: 'Alice',
        email: 'alice@example.com',
        role: 'USER',
      };

      jwtServiceMock.signAsync
        .mockResolvedValueOnce('access_from_refreshToken')
        .mockResolvedValueOnce('refresh_from_refreshToken');

      const result = await service.refreshToken(user);

      expect(result).toEqual({
        id: 'u1',
        accessToken: 'access_from_refreshToken',
        refreshToken: 'refresh_from_refreshToken',
      });
    });
  });

  describe('signOut', () => {
    it('clears cookie and revokes refresh token', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({
        sub: 'u1',
        jti: 'jti1',
      });

      const res = {
        clearCookie: jest.fn(),
      };

      redisMock.del.mockResolvedValue(1);

      const result = await service.signOut('rt', res as any);

      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(redisMock.del).toHaveBeenCalledWith('refresh:u1:jti1');
      expect(result).toEqual({ message: 'Sign out successfully' });
    });
  });

  // Explicitly cover rate limit branch inside checkLoginAttempts
  describe('checkLoginAttempts', () => {
    it('throws UnauthorizedException when login attempts exceed limit', async () => {
      process.env.LOGIN_LIMIT = '5';
      process.env.LOGIN_LIMIT_DURATION = '60';
      redisMock.get.mockResolvedValue('5'); // equal or greater than limit

      await expect(
        service.checkLoginAttempts('alice@example.com', false),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('deletes attempt counter when password verified', async () => {
      redisMock.get.mockResolvedValue('2');
      redisMock.del.mockResolvedValue(1);

      await service.checkLoginAttempts('alice@example.com', true);

      expect(redisMock.del).toHaveBeenCalledWith(
        'login_attempts:alice@example.com',
      );
    });
    it('increments attempts when invalid password and prior attempts exist', async () => {
      redisMock.get.mockResolvedValue('2'); // truthy branch of the ternary
      redisMock.set.mockResolvedValue('OK');
    
      await service.checkLoginAttempts('alice@example.com', false);
    
      expect(redisMock.set).toHaveBeenCalledWith(
        'login_attempts:alice@example.com',
        3, // 2 + 1
        'EX',
        Number(process.env.LOGIN_LIMIT_DURATION),
      );
    });
  });

  // Cover getUserById passthrough
  describe('getUserById', () => {
    it('returns user fetched by UsersService', async () => {
      usersServiceMock.findUserByKeyword.mockResolvedValue({ id: 'u1' });

      const result = await service.getUserById('u1');

      expect(usersServiceMock.findUserByKeyword).toHaveBeenCalledWith({
        id: 'u1',
      });
      expect(result).toEqual({ id: 'u1' });
    });
  });

  describe('signOut failure', () => {
    it('throws UnauthorizedException when verifyRefreshToken fails', async () => {
      jwtServiceMock.verifyAsync.mockRejectedValue(new Error('boom'));

      const res = {
        clearCookie: jest.fn(),
      };

      await expect(
        service.signOut('bad_rt', res as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(res.clearCookie).not.toHaveBeenCalled();
    });
  });
});
