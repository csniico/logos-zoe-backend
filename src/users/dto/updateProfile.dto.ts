import { IsEmail, IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 25)
  firstname?: string;

  @IsOptional()
  @IsString()
  @Length(2, 25)
  lastname?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;
}
