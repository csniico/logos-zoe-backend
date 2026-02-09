import { IsNotEmpty } from 'class-validator';

export class GetBooksDto {
  @IsNotEmpty()
  key: 'all' | 'new' | 'old';
}
