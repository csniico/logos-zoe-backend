import { IsBoolean } from 'class-validator';

export class UpdatePublishedStateDto {
  @IsBoolean()
  published: boolean;
}
