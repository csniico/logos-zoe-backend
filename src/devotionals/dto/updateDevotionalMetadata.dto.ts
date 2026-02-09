import { IsMongoId, IsOptional, IsString } from 'class-validator';
import type { ObjectId } from 'mongoose';

export class updateDevotionalMetadataDto {
  @IsMongoId()
  devotionalId: ObjectId;

  @IsOptional()
  @IsString()
  day?: string;

  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @IsString()
  year?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  scripture?: string;

  @IsOptional()
  @IsString()
  questions?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  type?: string;
}
