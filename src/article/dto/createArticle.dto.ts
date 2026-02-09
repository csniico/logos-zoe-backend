import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  article_title: string;

  @IsString()
  @IsOptional()
  article_image?: string;

  @IsString()
  @IsOptional()
  article_fullText?: string;

  @IsMongoId()
  category: string; // category _id as string
}
