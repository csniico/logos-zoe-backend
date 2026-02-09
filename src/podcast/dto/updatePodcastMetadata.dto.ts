import { IsOptional, IsString, IsIn } from 'class-validator';
import { PodcastCategory } from './createPodcast.dto';

export class UpdatePodcastMetadataDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn([
    PodcastCategory.WORD_OF_FAITH,
    PodcastCategory.PODCAST,
    PodcastCategory.PRAYERS,
  ])
  category?: string;
}
