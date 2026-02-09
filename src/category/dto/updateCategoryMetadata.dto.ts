import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryMetadataDto {
  @IsOptional()
  @IsString()
  category_name?: string;

  @IsOptional()
  @IsString()
  category_banner?: string;

  @IsOptional()
  @IsString()
  category_icon?: string;

  @IsOptional()
  @IsString()
  category_introText?: string;

  @IsOptional()
  @IsString()
  category_fullText?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
