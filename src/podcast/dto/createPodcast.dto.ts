import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';

export enum PodcastCategory {
  WORD_OF_FAITH = 'word-of-faith',
  PODCAST = 'podcast',
  PRAYERS = 'prayers',
}

export class CreatePodcastDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([
    PodcastCategory.WORD_OF_FAITH,
    PodcastCategory.PODCAST,
    PodcastCategory.PRAYERS,
  ])
  category: string;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;
}
