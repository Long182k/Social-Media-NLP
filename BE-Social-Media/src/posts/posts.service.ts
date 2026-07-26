import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { PaginationDto } from '../common/pagination.dto';
import { MediaType } from '@prisma/client';
import { CloudinaryService } from '../file/file.service';
import { AttachmentsUploadedType } from '../file/file.type';
import { NlpService } from '../nlp/nlp.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private nlpService: NlpService,
  ) {}

  async create(
    userId: string,
    createPostDto: CreatePostDto,
    files: Express.Multer.File[],
  ) {
    const { content, attachments } = createPostDto;
    let attachmentsUploaded: AttachmentsUploadedType[];

    const sentiment = await this.nlpService.evaluateContent(content);

    if (files && files.length > 0) {
      const uploadedFiles =
        await this.cloudinaryService.uploadMultipleFiles(files);

      attachmentsUploaded = uploadedFiles.map((file) => ({
        type: file.type === 'video' ? MediaType.VIDEO : MediaType.IMAGE,
        url: file.url,
      }));
    }

    return this.prisma.post.create({
      data: {
        content,
        userId,
        sentiment,
        attachments: {
          create: attachmentsUploaded ? attachmentsUploaded : attachments,
        },
      },
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
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const page = Number(paginationDto?.page || 1);
    const limit = Number(paginationDto?.limit || 10);
    const search = paginationDto?.search || undefined;
    const skip = (page - 1) * limit;

    try {
      const [posts, total] = await Promise.all([
        this.prisma.post.findMany({
          skip,
          take: limit,
          where: {
            content: search ? { contains: search } : undefined,
            groupId: null,
          },
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
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.post.count({
          where: {
            content: search ? { contains: search } : undefined,
            groupId: null,
          },
        }),
      ]);

      return {
        data: posts,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (err: any) {
      console.error('[PostsService.findAll] Error:', err);
      throw new InternalServerErrorException(err?.message || String(err));
    }
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: true,
        attachments: true,
        comments: {
          include: {
            user: true,
            attachments: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(id: string, userId: string, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.post.update({
      where: { id },
      data: {
        content: updatePostDto.content,
        attachments: {
          deleteMany: {},
          create: updatePostDto.attachments,
        },
      },
      include: {
        user: true,
        attachments: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.post.delete({
      where: { id },
    });

    return { message: 'Post deleted successfully' };
  }
}
