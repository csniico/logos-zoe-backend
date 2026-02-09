import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  category_name: string;

  @IsString()
  @IsOptional()
  category_banner?: string;

  @IsString()
  @IsOptional()
  category_icon?: string;

  @IsString()
  @IsOptional()
  category_introText?: string;

  @IsString()
  @IsOptional()
  category_fullText?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
