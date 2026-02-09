import { IsString, Length } from 'class-validator';
export class updateUserDto {
  @IsString()
  @Length(2, 25)
  firstname: string;

  @IsString()
  @Length(2, 25)
  lastname: string;
}
