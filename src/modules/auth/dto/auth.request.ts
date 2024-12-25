import { IsEmail } from 'class-validator';
import { CheckAny } from 'core/decorator/validators/checkAny.decorator';
import { IsPassword } from 'core/decorator/validators/password.decorator';

export class SignInDto {
  @CheckAny({ required: true })
  @IsEmail()
  email: string;

  @CheckAny({ required: true })
  password: string;
}

export class ResetPasswordDto {
  @CheckAny({ required: true })
  @IsEmail()
  email: string;
}

export class ChangePasswordDto {
  @CheckAny({ required: true })
  @IsEmail()
  email: string;

  @CheckAny({ required: true })
  @IsPassword()
  password: string;

  @CheckAny({ required: true })
  session: string;
}

export class RefreshTokenDto {
  @CheckAny({ required: true })
  refreshToken: string;
}

export class SignOutDto {
  @CheckAny({ required: true })
  accessToken: string;

  @CheckAny({ required: true })
  refreshToken: string;
}

export class SignUpDto {
  @CheckAny({ required: true })
  @IsEmail()
  email: string;

  @CheckAny({ required: true })
  @IsPassword()
  password: string;

  @CheckAny({ required: true })
  name: string;
}
