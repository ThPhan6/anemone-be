import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CheckMail } from 'core/decorator/validators/checkMail.decorator';
import { CheckPassword } from 'core/decorator/validators/checkPassword.decorator';
import { CheckRequired } from 'core/decorator/validators/common/checkRequired.decorator';

export class LoginReqDto {
  @CheckRequired(true)
  @ApiProperty({
    default: 'admin@gmail.com',
  })
  mailAddress: string;

  @CheckRequired(true)
  @ApiProperty({
    default: 'Abcd1234',
  })
  password: string;
}

export class RefreshSessionReqDto {
  @CheckRequired(true)
  @IsUUID(4)
  refreshToken: string;
}

export class ForgotPasswordReqDto {
  @CheckMail({ required: true })
  mailAddress: string;
}

export class ResetPasswordReqDto {
  @CheckRequired()
  @IsUUID(4)
  code: string;

  @CheckPassword({ required: true, min: 8, max: 32 })
  password: string;
}

export class ChangePasswordReqDto {
  @CheckRequired(true)
  password: string;

  @CheckPassword({ required: true, min: 8, max: 32 })
  newPassword: string;
}
