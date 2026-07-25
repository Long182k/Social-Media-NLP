import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/@decorator/current-user.decorator';
import { BookmarkService } from './bookmark.service';

@Controller('bookmark')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Post(':id')
  toggleBookmark(
    @Param('id') postId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.bookmarkService.toggleBookmark(postId, userId);
  }

  @Get('')
  getBookmarks(
    @CurrentUser('userId') userId: string,
  ) {
    return this.bookmarkService.getBookmarks(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookmarkService.remove(id);
  }
}
