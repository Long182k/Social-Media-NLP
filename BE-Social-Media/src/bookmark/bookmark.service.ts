import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async toggleBookmark(postId: string, user: any) {
    const { userId, nickName } = user;
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) throw new NotFoundException('Post not found');

    const existingBookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
      include: {
        post: true,
      },
    });

    if (existingBookmark) {
      await this.prisma.bookmark.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      // Return a proper notification object even when removing bookmark
      return await this.notificationService.create({
        content: `${nickName} removed your bookmark : ${post.content}`,
        type: NotificationType.BOOKMARK,
        senderId: userId,
        receiverId: post.userId,
      });
    }

    const result = await this.prisma.bookmark.create({
      data: {
        userId,
        postId,
      },
      include: {
        post: true,
        user: true,
      },
    });

    let notificationResult;

    if (result) {
      notificationResult = await this.notificationService.create({
        content: `${result.user.nickName} bookmarked your post : ${result.post.content}`,
        type: NotificationType.BOOKMARK,
        senderId: userId,
        receiverId: post.userId,
      });
    }

    return notificationResult;
  }

  async getBookmarks(userId: string) {
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
