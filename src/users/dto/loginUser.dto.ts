import { IsEmail, IsStrongPassword, Length } from 'class-validator';

export class loginUserDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  @Length(6, 20)
  password: string;
}
