import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import type { ObjectId } from 'mongoose';

export class UpdatePodcastFileDto {
  @IsMongoId()
  podcastId: ObjectId;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @IsNotEmpty()
  duration: number;
}
