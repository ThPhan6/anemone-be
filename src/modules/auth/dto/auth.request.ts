import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional } from 'class-validator';
import { CheckAny } from 'core/decorator/validators/checkAny.decorator';
import { IsPassword } from 'core/decorator/validators/password.decorator';

export class SignInDto {
  @CheckAny({ required: true })
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;

  @CheckAny({ required: true })
  password: string;

  @ApiProperty({ example: 'cms', enum: ['cms', 'mobile'], required: false })
  @IsOptional()
  @IsIn(['cms', 'mobile'])
  clientType?: 'cms' | 'mobile';
}

export class ResetPasswordDto {
  @CheckAny({ required: true })
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;
}

export class ChangePasswordDto {
  @CheckAny({ required: true })
  @IsEmail({}, { message: 'Email is invalid' })
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

  @CheckAny({ required: true })
  email: string;
}

export class SignOutDto {
  @CheckAny({ required: true })
  accessToken: string;

  @CheckAny({ required: true })
  refreshToken: string;
}

export class SignUpDto {
  @CheckAny({ required: true })
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;

  @CheckAny({ required: true })
  @IsPassword()
  password: string;

  @CheckAny({ required: true })
  firstName: string;

  @CheckAny({ required: true })
  lastName: string;
}

export class GetProfileDto {
  @IsEmail()
  email: string;
}
