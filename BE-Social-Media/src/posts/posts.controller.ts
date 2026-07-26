import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { InteractionsService } from './interactions.service';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { PaginationDto } from '../common/pagination.dto';
import { CreateCommentDto, CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MOCK_POSTS } from '../common/mock-data';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly interactionsService: InteractionsService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 5))
  create(
    @CurrentUser('userId') userId: string,
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.postsService.create(userId, createPostDto, files);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      return await this.postsService.findAll(paginationDto);
    } catch {
      return {
        data: MOCK_POSTS.slice(0, 10),
        meta: { total: MOCK_POSTS.length, page: 1, limit: 10, totalPages: 4 },
      };
    }
  }

  @Get('single/:id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, userId, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.postsService.remove(id, userId);
  }

  @Post(':id/like')
  toggleLike(
    @Param('id') postId: string,
    // @CurrentUser('userId') userId: string,
    @CurrentUser() user: any,
  ) {
    return this.interactionsService.toggleLike(postId, user.userId);
  }

  @Post(':id/comment')
  @UseInterceptors(FilesInterceptor('files', 5))
  createComment(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() createCommentDto: CreateCommentDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.interactionsService.createComment(
      id,
      userId,
      createCommentDto,
      files,
    );
  }
}
