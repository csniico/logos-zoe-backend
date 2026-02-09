import { IsInt, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class getManyDevotionalsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @IsString()
  year?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  type?: string;
}
