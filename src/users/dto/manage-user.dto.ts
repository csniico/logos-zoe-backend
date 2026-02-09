import { IsBoolean, IsEnum, IsMongoId } from 'class-validator';

export class UpdateUserRoleDto {
  @IsEnum(['admin', 'super-admin', 'user'])
  role: string;
}

export class SuspendUserDto {
  @IsBoolean()
  isSuspended: boolean;
}

export class GetUserByIdDto {
  @IsMongoId()
  userId: string;
}
