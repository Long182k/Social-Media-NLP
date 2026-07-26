import { MediaType } from '@prisma/client';

export type AttachmentsUploadedType = {
  type: MediaType;
  url: string;
};
