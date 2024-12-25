import { IsEmail, IsEnum } from 'class-validator';
import { UserRole } from 'common/enums/user.enum';
import { ExposeApiOptional } from 'core/decorator/property.decorator';
import { CheckAny } from 'core/decorator/validators/checkAny.decorator';
import { IsPassword } from 'core/decorator/validators/password.decorator';
import { ApiBaseGetListQueries } from 'core/types/apiQuery.type';

export class CreateUserDto {
  @CheckAny({ required: true })
  @IsEmail()
  email: string;

  @CheckAny({ required: true })
  name: string;

  @CheckAny({ required: true })
  @IsPassword()
  password: string;

  @CheckAny({ required: true })
  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateUserDto {
  @CheckAny({ required: true })
  name: string;

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
  role: UserRole;

  @ExposeApiOptional()
  isActive: boolean;
}

export class UpdateProfileDto {
  @CheckAny({ required: true })
  name: string;
}
