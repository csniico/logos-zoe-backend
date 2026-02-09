import { IsEnum, IsNotEmpty } from 'class-validator';

export enum AllowedImageKeys {
  ARTICLES = 'article-images',
  CATEGORIES = 'category-images',
  DEVOTIONAL = 'devotional-images',
}

export class ImageDocumentUploadDto {
  @IsNotEmpty()
  @IsEnum(AllowedImageKeys, {
    message:
      'Expected key to be one of {article-images,category-images,devotional-images}',
  })
  key: AllowedImageKeys;
}

export enum AllowedDocumentKeys {
  ARTICLES = 'article-documents',
  CATEGORIES = 'category-documents',
  DEVOTIONAL = 'devotional-documents',
}
export class WordDocumentUploadDto {
  @IsEnum(AllowedDocumentKeys, {
    message:
      'Expected key to be one of {article-documents,category-documents,devotional-documents}',
  })
  key: AllowedDocumentKeys;
}

export enum AllowedAudioFileKeys {
  WORD_OF_FAITH = 'wof-audio',
  PRAYERS = 'prayer-audio',
  PODCASTS = 'podcast-audio',
}
export class AudioFileUploadDto {
  @IsEnum(AllowedAudioFileKeys, {
    message:
      'Expected key to be one of {wof-audio, prayer-audio, podcast-audio}',
  })
  key: AllowedAudioFileKeys;
}
