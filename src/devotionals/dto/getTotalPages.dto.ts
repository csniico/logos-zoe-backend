import { IsInt } from 'class-validator';

export class getTotalPagesDto {
  @IsInt()
  limit: number;
}
