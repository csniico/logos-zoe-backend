import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import type { ObjectId } from 'mongoose';

export class SetCategoryContentDto {
  @IsMongoId()
  categoryId: ObjectId;

  @IsString()
  @IsNotEmpty()
  category_introText: string;

  @IsString()
  @IsNotEmpty()
  category_fullText: string;
}
