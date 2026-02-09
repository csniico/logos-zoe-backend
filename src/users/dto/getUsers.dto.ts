import { IsInt, IsPositive } from 'class-validator';

export class getUsersDto {
  @IsInt()
  @IsPositive()
  page: number;

  @IsInt()
  @IsPositive()
  limit: number;
}
