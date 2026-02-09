import { IsString, IsStrongPassword, Length } from 'class-validator';

export class updatePasswordDto {
  @IsString()
  @Length(6, 20)
  @IsStrongPassword()
  password: string;
}
