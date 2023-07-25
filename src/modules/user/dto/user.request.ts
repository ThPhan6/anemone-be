import { ApiProperty } from '@nestjs/swagger';
import { ErrorCode } from 'common/constants/app.constants';
import { ExposeApiOptional } from 'core/decorator/property.decorator';
import { CheckAny } from 'core/decorator/validators/checkAny.decorator';
import { CheckMail } from 'core/decorator/validators/checkMail.decorator';
import { CheckPassword } from 'core/decorator/validators/checkPassword.decorator';
import { CheckRequired } from 'core/decorator/validators/common/checkRequired.decorator';
import { ApiBaseGetListQueries } from 'core/types/apiQuery.type';
import { NumericIdResponse } from 'core/types/response.type';

export class UserCreateReqDto {
  @CheckAny({ required: true, max: 64 })
  userName: string;

  @CheckPassword({ required: true, min: 8, max: 32 })
  password: string;

  @ApiProperty({ description: `${ErrorCode.itemExisting}` })
  @CheckMail({ required: true, max: 128 })
  mailAddress: string;

  @CheckAny({ required: false, max: 400 })
  note: string;
}

export class UserUpdateReqDto {
  @CheckAny({ required: false, max: 64 })
  userName: string;

  @CheckPassword({ required: false, min: 8, max: 32 })
  password: string;

  @ApiProperty({ description: `${ErrorCode.itemExisting}` })
  @CheckMail({ required: false, max: 128 })
  mailAddress: string;

  @CheckAny({ required: false, max: 400 })
  note: string;

  @CheckRequired(false)
  invalidFlg: boolean;
}

export class SendMailToUserReqDto extends NumericIdResponse {}

export class UserGetListQueries extends ApiBaseGetListQueries {
  @ExposeApiOptional()
  userName?: string;

  @ExposeApiOptional()
  mailAddress?: string;
}
