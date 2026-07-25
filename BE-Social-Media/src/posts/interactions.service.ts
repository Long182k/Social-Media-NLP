import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
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
    const { userId, nickName } = user;
    try {
      return await this.prisma.$transaction(async (tx) => {
        const post = await tx.post.findUnique({
          where: { id: postId },
        });

        const existingLike = await tx.like.findUnique({
          where: {
            userId_postId: { userId, postId },
          },
        });

        if (existingLike) {
          await tx.like.delete({
            where: { userId_postId: { userId, postId } },
          });
          return await this.notificationService.create({
            content: `${nickName} unliked your post : ${post.content}`,
            type: NotificationType.LIKE,
            senderId: userId,
            receiverId: post.userId,
          });
        }

        const result = await tx.like.create({
          data: { userId, postId },
          include: { user: true, post: true },
        });

        let notification;
        if (result.post.userId !== userId) {
          notification = await this.notificationService.create({
            content: `${result.user.nickName} liked your post`,
            type: NotificationType.LIKE,
            senderId: userId,
            receiverId: result.post.userId,
          });
        }

        return notification;
      });
    } catch (error) {
      // Prisma unique constraint violation
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Conflict error, meaning the like already exists (race condition)
          return { liked: true, message: 'Already liked by this user' };
        }
      }
      throw new ConflictException('Failed to toggle like');
    }
  }

  async createComment(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
    files: Express.Multer.File[],
  ) {
    const { content } = createCommentDto;

    let attachmentsUploaded: AttachmentsUploadedType[];

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) throw new NotFoundException('Post not found');

    const sentiment = await this.nlpService.evaluateContent(content);

    if (files && files.length > 0) {
      const uploadedFiles =
        await this.cloudinaryService.uploadMultipleFiles(files);

      attachmentsUploaded = uploadedFiles.map((file) => ({
        type: file.type as 'image' | 'video',
        url: file.url,
      }));
    }

    const result = await this.prisma.comment.create({
      data: {
        content,
        userId,
        postId,
        sentiment,
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

    if (result && post.userId !== userId) {
      await this.notificationService.create({
        content: `${result.user.userName} commented on your post`,
        type: NotificationType.COMMENT,
        senderId: userId,
        receiverId: post.userId,
      });
    }

    return result;
  }
}
