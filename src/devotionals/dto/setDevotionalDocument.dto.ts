import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { ObjectId } from 'mongoose';

export interface biblePassagesInterface {
  book: string;
  chapters: {
    number: number;
    startVerse?: number;
    endVerse?: number;
  }[];
}

export class BibleChapterDto {
  @IsNumber()
  number: number;

  @IsOptional()
  @IsNumber()
  startVerse?: number;

  @IsOptional()
  @IsNumber()
  endVerse?: number;
}

export class BiblePassageDto {
  @IsString()
  book: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BibleChapterDto)
  chapters: BibleChapterDto[];
}

export class setDevotionalDocumentDto {
  @IsMongoId()
  devotionalId: ObjectId;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BiblePassageDto)
  biblePassages?: BiblePassageDto[];

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  listOfImageAssets?: string[];
}
