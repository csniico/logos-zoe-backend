import { IsString } from 'class-validator';

export class createDevotionalDto {
  @IsString()
  day: string;

  @IsString()
  month: string;

  @IsString()
  year: string;

  @IsString()
  title: string;

  @IsString()
  scripture: string;

  @IsString()
  questions: string;

  @IsString()
  author: string;

  @IsString()
  type: string;
}
