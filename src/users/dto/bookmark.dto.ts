import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class AddBookmarkDto {
  @IsNotEmpty()
  @IsEnum(['article', 'podcast', 'devotional'])
  resourceType: string;

  @IsNotEmpty()
  @IsString()
  resourceId: string;
}

export class RemoveBookmarkDto {
  @IsNotEmpty()
  @IsString()
  resourceId: string;
}
