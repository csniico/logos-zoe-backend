import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdateArticleMetadataDto {
  @IsOptional()
  @IsString()
  article_title?: string;

  @IsOptional()
  @IsString()
  article_image?: string;

  @IsOptional()
  @IsMongoId()
  category?: string;
}
