import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import Redlock from 'redlock';
import { PrismaService } from '../prisma.service';
import { GetUserByKeywordDTO } from './dto/get-user.dto';
import {
  UpdateHashedRefreshTokenDTO,
  UpdateUserDto,
} from './dto/update-user.dto';
import { UserRepository } from './users.repository';

interface PaginationParams {
  page: number;
  limit: number;
}

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UserRepository,
    private prisma: PrismaService,
    @Inject('REDLOCK') private redlock: Redlock,
  ) {}

  async updateHashedRefreshToken(
    updateHashedRefreshTokenDTO: UpdateHashedRefreshTokenDTO,
  ) {
    return await this.userRepository.updateHashedRefreshToken(
      updateHashedRefreshTokenDTO,
    );
  }

  async findAll(userId: string) {
    try {
      return await this.userRepository.findAllUsers(userId);
    } catch {
      return [];
    }
  }

  async findAvailableContact(userId: string) {
    try {
      return await this.userRepository.findAvailableContact(userId);
    } catch {
      return [];
    }
  }

  async findOne(email: string) {
    return await this.userRepository.findUserByEmail(email);
  }

  async findUserByKeyword(keyword: GetUserByKeywordDTO) {
    return await this.userRepository.findUserByKeyword(keyword);
  }

  async editProfile(updateUserDto: UpdateUserDto, userId: string) {
    return await this.userRepository.update(userId, {
      ...updateUserDto,
      dateOfBirth: new Date(updateUserDto.dateOfBirth),
    });
  }

  async updateAvatar(id: string, avatarUrl: string) {
    return await this.userRepository.update(id, { avatarUrl });
  }

  async updateCoverPage(id: string, coverPageUrl: string) {
    return await this.userRepository.update(id, { coverPageUrl });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async followUser(followerId: string, userId: string) {
    // Acquire Redis lock
    const lockKey = `lock:user:${followerId}:follow:${userId}`;
    let lock = null;

    try {
      // Using redlock to lock the resource for 5 seconds
      lock = await this.redlock.acquire([lockKey], 5000);

      // First check if users exist
      const [follower, user] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: followerId },
        }),
        this.prisma.user.findUnique({
          where: { id: userId },
        }),
      ]);

      if (!follower || !user) {
        throw new NotFoundException('User not found');
      }

      // Check if already following
      const existingFollow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: followerId,
            followingId: userId,
          },
        },
      });

      if (existingFollow) {
        // Unfollow
        await this.prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId: followerId,
              followingId: userId,
            },
          },
        });
      } else {
        await this.prisma.follow.create({
          // Follow
          data: {
            followerId: followerId,
            followingId: userId,
          },
        });
      }

      // Get updated counts
      const [followers, following] = await Promise.all([
        this.prisma.follow.count({
          where: { followingId: userId },
        }),
        this.prisma.follow.count({
          where: { followerId: userId },
        }),
      ]);

      return {
        isFollowing: !existingFollow,
        followersCount: followers,
        followingCount: following,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Handle Redlock error
      if (error.name === 'ExecutionError') {
        console.error('Redlock execution error:', error.message);
      }

      // Other errors
      console.error('Error in followUser:', error);
      throw new Error('Failed to process follow request');
    } finally {
      // Always release the lock if it exists and was acquired successfully
      if (lock) {
        try {
          await lock.release();
        } catch (error) {
          console.error('Error releasing lock:', error);
        }
      }
    }
  }

  async getFollowStatus(followerId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [isFollowing, followers, following] = await Promise.all([
      this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: followerId,
            followingId: userId,
          },
        },
      }),
      this.prisma.follow.count({
        where: { followingId: userId },
      }),
      this.prisma.follow.count({
        where: { followerId: userId },
      }),
    ]);

    return {
      isFollowing: !!isFollowing,
      followersCount: followers,
      followingCount: following,
    };
  }

  async getFollowers(userId: string, { page, limit }: PaginationParams) {
    try {
      const skip = (page - 1) * limit;

      const [followers, total] = await Promise.all([
        this.prisma.follow.findMany({
          where: {
            followingId: userId,
          },
          include: {
            follower: {
              select: {
                id: true,
                userName: true,
                avatarUrl: true,
                bio: true,
                lastLoginAt: true,
              },
            },
          },
          skip,
          take: limit,
        }),
        this.prisma.follow.count({
          where: {
            followingId: userId,
          },
        }),
      ]);

      return {
        data: followers.map((follow) => follow.follower),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch {
      return {
        data: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
      };
    }
  }

  async getFollowing(userId: string, { page, limit }: PaginationParams) {
    try {
      const skip = (page - 1) * limit;

      const [following, total] = await Promise.all([
        this.prisma.follow.findMany({
          where: {
            followerId: userId,
          },
          include: {
            following: {
              select: {
                id: true,
                userName: true,
                avatarUrl: true,
                bio: true,
              },
            },
          },
          skip,
          take: limit,
        }),
        this.prisma.follow.count({
          where: {
            followerId: userId,
          },
        }),
      ]);

      return {
        data: following.map((follow) => follow.following),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch {
      return {
        data: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
      };
    }
  }

  async getSuggestedUsers(userId: string, { page, limit }: PaginationParams) {
    try {
      const skip = (page - 1) * limit;

      const following = await this.prisma.follow.findMany({
        where: {
          followerId: userId,
        },
        select: {
          followingId: true,
        },
      });

      const followingIds = following.map((f) => f.followingId);

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where: {
            AND: [
              {
                id: {
                  notIn: [...followingIds, userId],
                },
              },
              {
                isActive: true,
              },
            ],
          },
          select: {
            id: true,
            userName: true,
            avatarUrl: true,
            bio: true,
            _count: {
              select: {
                followers: true,
                following: true,
              },
            },
          },
          orderBy: {
            followers: {
              _count: 'desc',
            },
          },
          skip,
          take: limit,
        }),
        this.prisma.user.count({
          where: {
            AND: [
              {
                id: {
                  notIn: [...followingIds, userId],
                },
              },
              {
                isActive: true,
              },
            ],
          },
        }),
      ]);

      return {
        suggestions: users.map((user) => ({
          ...user,
          followersCount: user._count.followers,
          followingCount: user._count.following,
          _count: undefined,
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch {
      return {
        suggestions: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
      };
    }
  }

  async getRecentBirthdayUsers(
    userId: string,
    { page, limit }: PaginationParams,
  ) {
    try {
      const skip = (page - 1) * limit;

      const following = await this.prisma.follow.findMany({
        where: {
          followerId: userId,
        },
        select: {
          followingId: true,
        },
      });
      const followingIds = following.map((f) => f.followingId);

      if (followingIds.length === 0) {
        return {
          latestBirthday: [],
        };
      }

      const users = await this.prisma.$queryRaw<
        {
          id: string;
          userName: string;
          avatarUrl: string | null;
          dateOfBirth: Date;
        }[]
      >`
      SELECT id, "userName", "avatarUrl", "dateOfBirth"
      FROM users
      WHERE isActive = true 
        AND dateOfBirth IS NOT NULL
        AND MONTH(dateOfBirth) = ${new Date().getMonth() + 1}
        AND DAY(dateOfBirth) >= ${new Date().getDate()}
        AND id IN (${Prisma.join(followingIds)})
      ORDER BY DAY(dateOfBirth) ASC
      LIMIT ${limit}
      OFFSET ${skip}
      `;

      return {
        latestBirthday: users.map((user) => ({
          ...user,
        })),
      };
    } catch {
      return {
        latestBirthday: [],
      };
    }
  }
}
