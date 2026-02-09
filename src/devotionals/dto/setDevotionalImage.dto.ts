import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import type { ObjectId } from 'mongoose';

export class setDevotionalImageDto {
  @IsMongoId()
  devotionalId: ObjectId;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @IsString()
  @IsNotEmpty()
  fileKey: string;
}
