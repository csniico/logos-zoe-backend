import { IsEmail } from 'class-validator';

export class verifyEmailDto {
  @IsEmail()
  email: string;
}
