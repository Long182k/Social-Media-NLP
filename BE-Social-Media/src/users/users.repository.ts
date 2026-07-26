import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as argon from 'argon2';
import { PrismaService } from '../prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { GetUserByKeywordDTO } from './dto/get-user.dto';
import { UpdateHashedRefreshTokenDTO } from './dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<User | null> {
    {
      return await this.prisma.user.findUnique({
        where: { email },
      });
    }
  }

  async findUserByKeyword(keyword: GetUserByKeywordDTO): Promise<User | null> {
    const { userName, id, email, avatarUrl, bio } = keyword;
    const orConditions: any[] = [];
    if (userName) orConditions.push({ userName });
    if (email) orConditions.push({ email });
    if (id) orConditions.push({ id });
    if (avatarUrl) orConditions.push({ avatarUrl });
    if (bio) orConditions.push({ bio });

    if (orConditions.length === 0) {
      return null;
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: orConditions,
      },
      include: {
        posts: {
          include: {
            user: true,
            comments: {
              include: {
                user: true,
                attachments: true,
              },
            },
            attachments: true,
            _count: {
              select: {
                likes: true,
                comments: true,
                bookmarks: true,
              },
            },
          },
        },
        comments: true,
        likes: true,
        followers: true,
        following: true,
      },
    });

    return user;
  }

  async findAllUsers(userId: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        NOT: {
          id: userId,
        },
      },
    });
  }

  async findAvailableContact(userId: string): Promise<User[]> {
    const existingChatRoom = await this.prisma.chatRoom.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: true,
      },
    });

    const availableContactIds = existingChatRoom.flatMap((room) =>
      room.participants
        .filter((participant) => participant.userId !== userId)
        .map((participant) => participant.userId),
    );

    return this.prisma.user.findMany({
      where: {
        id: {
          notIn: [...availableContactIds, userId],
        },
      },
    });
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    data.avatarUrl =
      'https://res.cloudinary.com/dcivdqyyj/image/upload/v1736957755/sq1svii2veo8hewyelud.jpg';
    data.coverPageUrl =
      'https://res.cloudinary.com/dcivdqyyj/image/upload/v1736957736/mfbprtxbj5bjj8nkzt7f.jpg';

    const { username, password, email, avatarUrl, coverPageUrl } = data;

    const hashedPassword = await argon.hash(password);

    const result = await this.prisma.user.create({
      data: {
        userName: username,
        nickName: username,
        email,
        hashedPassword,
        avatarUrl: avatarUrl,
        coverPageUrl: coverPageUrl,
      },
    });

    delete result.hashedPassword;

    return result;
  }

  async updateHashedRefreshToken(
    params: UpdateHashedRefreshTokenDTO,
  ): Promise<User> {
    const { hashedRefreshToken, userId } = params;
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        hashedRefreshToken,
      },
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  async update(userId: string, data: Partial<User>) {
    if (data.nickName) {
      const existingUserName = await this.prisma.user.findUnique({
        where: { nickName: data.nickName },
      });

      if (existingUserName && existingUserName.id !== userId) {
        throw new NotFoundException('User name already exist in system.');
      }
    }

    const updateData: Partial<User> = {};

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    });

    const result = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      ...result,
      userId,
    };
  }
}
