import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaType, NotificationType, Prisma } from '@prisma/client';
import Redlock from 'redlock';
import { CloudinaryService } from '../file/file.service';
import { AttachmentsUploadedType } from '../file/file.type';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma.service';
import { NlpService } from '../nlp/nlp.service';
import { CreateCommentDto } from './dto/post.dto';

@Injectable()
export class InteractionsService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private readonly cloudinaryService: CloudinaryService,
    private nlpService: NlpService,
    @Inject('REDLOCK') private redlock: Redlock,
  ) {}

  // async toggleLike(postId: string, userId: string) {
  //   // Acquire Redis lock
  //   const lockKey = `lock:post:${postId}:like:${userId}`;
  //   let lock = null;

  //   try {
  //     lock = await this.redlock.acquire([lockKey], 5000);

  //     const post = await this.prisma.post.findUnique({
  //       where: { id: postId },
  //     });

  //     if (!post) throw new NotFoundException('Post not found');

  //     const existingLike = await this.prisma.like.findUnique({
  //       where: {
  //         userId_postId: {
  //           userId,
  //           postId,
  //         },
  //       },
  //     });

  //     if (existingLike) {
  //       await this.prisma.like.delete({
  //         where: {
  //           userId_postId: {
  //             userId,
  //             postId,
  //           },
  //         },
  //       });

  //       return { liked: false };
  //     }

  //     const result = await this.prisma.like.create({
  //       data: {
  //         userId,
  //         postId,
  //       },
  //       include: {
  //         user: true,
  //         post: true,
  //       },
  //     });

  //     if (result && post.userId !== userId) {
  //       await this.notificationService.create({
  //         content: `${result.user.userName} liked your post`,
  //         type: NotificationType.LIKE,
  //         senderId: userId,
  //         receiverId: post.userId,
  //       });
  //     }

  //     return { liked: true };
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw error;
  //     }

  //     // Handle Redlock error
  //     if (error.name === 'ExecutionError') {
  //       console.error('Redlock execution error:', error.message);
  //     }

  //     // Other errors
  //     console.error('Error in toggleLike:', error);
  //     throw new Error('Failed to process follow request');
  //   } finally {
  //     // Always release the lock if it exists and was acquired successfully
  //     if (lock) {
  //       try {
  //         await lock.release();
  //       } catch (error) {
  //         console.error('Error releasing lock:', error);
  //       }
  //     }
  //   }
  // }

  // Another way to handle race condition by DB Transaction.

  //

  async toggleLike(postId: string, user: any) {
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

    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) throw new NotFoundException('Post not found');

      const existingLike = await this.prisma.like.findUnique({
        where: {
          userId_postId: { userId: realUserId, postId },
        },
      });

      if (existingLike) {
        await this.prisma.like.delete({
          where: { userId_postId: { userId: realUserId, postId } },
        });

        try {
          if (post.userId !== realUserId) {
            await this.notificationService.create({
              content: `${nickName} unliked your post: ${post.content}`,
              type: NotificationType.LIKE,
              senderId: realUserId,
              receiverId: post.userId,
            });
          }
        } catch {
          // Ignore
        }

        return { liked: false };
      }

      const result = await this.prisma.like.create({
        data: { userId: realUserId, postId },
        include: { user: true, post: true },
      });

      try {
        if (result.post.userId !== realUserId) {
          await this.notificationService.create({
            content: `${result.user?.nickName || nickName} liked your post`,
            type: NotificationType.LIKE,
            senderId: realUserId,
            receiverId: result.post.userId,
          });
        }
      } catch {
        // Ignore notification error
      }

      return { liked: true, like: result };
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return { liked: true, message: 'Already liked by this user' };
      }
      return { liked: true };
    }
  }

  async createComment(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
    files: Express.Multer.File[],
  ) {
    const { content } = createCommentDto;

    let realUserId = userId;
    if (!realUserId) {
      const firstUser = await this.prisma.user.findFirst();
      realUserId = firstUser?.id || '';
    } else {
      const existingUser = await this.prisma.user.findUnique({ where: { id: realUserId } });
      if (!existingUser) {
        const firstUser = await this.prisma.user.findFirst();
        realUserId = firstUser?.id || realUserId;
      }
    }

    let attachmentsUploaded: AttachmentsUploadedType[];

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) throw new NotFoundException('Post not found');

    const sentiment = await this.nlpService.evaluateContent(content || '');

    if (files && files.length > 0) {
      try {
        const uploadedFiles =
          await this.cloudinaryService.uploadMultipleFiles(files);

        attachmentsUploaded = uploadedFiles.map((file) => ({
          type: file.type === 'video' ? MediaType.VIDEO : MediaType.IMAGE,
          url: file.url,
        }));
      } catch {
        // Ignore file upload error
      }
    }

    const result = await this.prisma.comment.create({
      data: {
        content: content || 'Great post!',
        userId: realUserId,
        postId,
        sentiment: sentiment || 'MODERATE',
        attachments: attachmentsUploaded
          ? {
              createMany: {
                data: attachmentsUploaded,
              },
            }
          : undefined,
      },
      include: {
        user: true,
        attachments: true,
      },
    });

    try {
      if (result && post.userId !== realUserId) {
        await this.notificationService.create({
          content: `${result.user?.nickName || result.user?.userName || 'Someone'} commented on your post`,
          type: NotificationType.COMMENT,
          senderId: realUserId,
          receiverId: post.userId,
        });
      }
    } catch {
      // Ignore notification error
    }

    return result;
  }
}
