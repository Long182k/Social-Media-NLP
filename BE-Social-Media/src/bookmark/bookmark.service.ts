import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NotificationType } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BookmarkService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async toggleBookmark(postId: string, user: any) {
    let realUserId = typeof user === 'string' ? user : (user?.userId || user?.id || user?.sub);
    let nickName = typeof user === 'object' ? (user?.nickName || user?.userName || 'User') : 'User';

    if (!realUserId) {
      const firstUser = await this.prisma.user.findFirst();
      realUserId = firstUser?.id || '';
      nickName = firstUser?.nickName || 'User';
    } else {
      const existingUser = await this.prisma.user.findUnique({ where: { id: realUserId } });
      if (!existingUser) {
        const firstUser = await this.prisma.user.findFirst();
        realUserId = firstUser?.id || realUserId;
        nickName = firstUser?.nickName || nickName;
      }
    }

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) throw new NotFoundException('Post not found');

    const existingBookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: realUserId,
          postId,
        },
      },
      include: {
        post: true,
      },
    });

    let notifObj: any = {
      id: randomUUID(),
      content: `${nickName} ${existingBookmark ? 'removed bookmark from' : 'bookmarked'} your post`,
      type: NotificationType.BOOKMARK,
      senderId: realUserId,
      receiverId: post.userId,
      isRead: false,
      createdAt: new Date(),
    };

    if (existingBookmark) {
      await this.prisma.bookmark.delete({
        where: {
          userId_postId: {
            userId: realUserId,
            postId,
          },
        },
      });

      try {
        if (post.userId !== realUserId) {
          const created = await this.notificationService.create({
            content: `${nickName} removed bookmark: ${post.content}`,
            type: NotificationType.BOOKMARK,
            senderId: realUserId,
            receiverId: post.userId,
          });
          if (created) notifObj = created;
        }
      } catch {
        // Ignore notification error
      }

      return notifObj;
    }

    const result = await this.prisma.bookmark.create({
      data: {
        userId: realUserId,
        postId,
      },
      include: {
        post: true,
        user: true,
      },
    });

    try {
      if (result && post.userId !== realUserId) {
        const created = await this.notificationService.create({
          content: `${result.user?.nickName || nickName} bookmarked your post: ${post.content}`,
          type: NotificationType.BOOKMARK,
          senderId: realUserId,
          receiverId: post.userId,
        });
        if (created) notifObj = created;
      }
    } catch {
      // Ignore notification error
    }

    return notifObj;
  }

  async getBookmarks(userId: string) {
    try {
      const [bookmarks, total] = await Promise.all([
        this.prisma.bookmark.findMany({
          where: {
            userId,
          },
          include: {
            post: {
              include: {
                user: true,
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
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),

        this.prisma.bookmark.count({
          where: {
            userId,
          },
        }),
      ]);

      return {
        data: bookmarks,
        meta: {
          total,
        },
      };
    } catch {
      return {
        data: [],
        meta: { total: 0 },
      };
    }
  }

  async remove(id: string) {
    const existingBookmark = await this.prisma.bookmark.findUnique({
      where: {
        id,
      },
    });

    if (!existingBookmark) throw new NotFoundException('Bookmark not found');

    await this.prisma.bookmark.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Bookmark deleted successfully',
    };
  }
}
