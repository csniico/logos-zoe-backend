import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import type { ObjectId } from 'mongoose';

export class SetArticleContentDto {
  @IsMongoId()
  articleId: ObjectId;

  @IsString()
  @IsNotEmpty()
  article_fullText: string;
}
