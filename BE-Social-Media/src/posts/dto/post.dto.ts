import { MediaType } from '@prisma/client';

export class CreatePostDto {
  content: string;
  attachments?: { type: MediaType; url: string }[];
}

export class UpdatePostDto {
  content?: string;
  attachments?: { type: MediaType; url: string }[];
}

export class CreateCommentDto {
  content: string;
}
