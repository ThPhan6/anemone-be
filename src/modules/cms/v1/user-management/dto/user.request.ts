import { IsEmail, IsEnum, Matches } from 'class-validator';
import { UserRole } from 'common/enums/user.enum';
import { ExposeApiOptional } from 'core/decorator/property.decorator';
import { CheckAny } from 'core/decorator/validators/checkAny.decorator';
import { ApiBaseGetListQueries } from 'core/types/apiQuery.type';

export class CreateUserDto {
  @CheckAny({ required: true })
  @IsEmail()
  email: string;

  @CheckAny({ required: true })
  name: string;

  @CheckAny({ required: true })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must contain at least 1 number, 1 special character, 1 uppercase letter, and 1 lowercase letter',
  })
  password: string;

  @CheckAny({ required: true })
  @IsEnum([UserRole.ADMIN, UserRole.STAFF])
  role: UserRole;
}

export class UpdateUserDto {
  @CheckAny({ required: true })
  name: string;

  @CheckAny({ required: true })
  @IsEnum([UserRole.ADMIN, UserRole.STAFF])
  role: UserRole;
}

export class UserGetListQueries extends ApiBaseGetListQueries {
  @ExposeApiOptional()
  name: string;

  @ExposeApiOptional()
  email: string;

  @ExposeApiOptional()
  role: UserRole;
}
