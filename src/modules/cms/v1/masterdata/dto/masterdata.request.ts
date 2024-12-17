import { IsEnum } from 'class-validator';
import { SettingType } from 'common/enums/setting.enum';
import { ExposeApiOptional } from 'core/decorator/property.decorator';
import { CheckAny } from 'core/decorator/validators/checkAny.decorator';
import { ApiBaseGetListQueries } from 'core/types/apiQuery.type';

export class CreateMasterDataDto {
  @CheckAny({ required: true })
  name: string;

  @CheckAny({ required: false })
  value: string;

  @CheckAny({ required: true })
  @IsEnum(SettingType)
  type: SettingType;
}

export class UpdateMasterDataDto {
  @CheckAny({ required: true })
  name: string;

  @CheckAny({ required: true })
  value: string;
}

export class MasterDataGetListQueries extends ApiBaseGetListQueries {
  @ExposeApiOptional()
  name: string;

  @ExposeApiOptional()
  value: string;

  @ExposeApiOptional()
  type: SettingType;
}
