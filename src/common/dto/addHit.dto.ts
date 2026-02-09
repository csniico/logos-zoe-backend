import { IsString, IsNotEmpty } from 'class-validator';

export class AddHitDto {
  @IsString()
  @IsNotEmpty()
  hit: string;
}
