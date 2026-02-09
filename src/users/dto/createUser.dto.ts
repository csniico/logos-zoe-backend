import { IsEmail, IsString, IsStrongPassword, Length } from 'class-validator';

export class createUserDto {
  @IsString()
  @Length(2, 25)
  firstname: string;

  @IsString()
  @Length(2, 25)
  lastname: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 20)
  @IsStrongPassword()
  password: string;
}
