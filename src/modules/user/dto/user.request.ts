import { IsEmail, IsEnum } from 'class-validator';
import { ExposeApiOptional } from 'core/decorator/property.decorator';
import { CheckAny } from 'core/decorator/validators/checkAny.decorator';
import { IsPassword } from 'core/decorator/validators/password.decorator';
import { ApiBaseGetListQueries } from 'core/types/apiQuery.type';
import { UserRole } from 'modules/user/user.type';

export class CreateUserDto {
  @CheckAny({ required: true })
  @IsEmail()
  email: string;

  @CheckAny({ required: true })
  firstName: string;

  @CheckAny({ required: true })
  lastName: string;

  @CheckAny({ required: true })
  @IsPassword()
  password: string;

  @CheckAny({ required: true })
  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateUserDto {
  @CheckAny({ required: false })
  firstName: string;

  @CheckAny({ required: false })
  lastName: string;

  @CheckAny({ required: true })
  @IsEnum(UserRole)
  role: UserRole;

  @CheckAny({ required: true })
  isActive: boolean;
}

export class ChangePasswordDto {
  @CheckAny({ required: true })
  @IsPassword()
  password: string;
}

export class UserGetListQueries extends ApiBaseGetListQueries {
  @ExposeApiOptional()
  role: UserRole[];

  @ExposeApiOptional()
  isActive: boolean;
}

export class UpdateProfileDto {
  @CheckAny({ required: true })
  firstName: string;

  @CheckAny({ required: true })
  lastName: string;
}
