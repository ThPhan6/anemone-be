import { Type } from 'class-transformer';
import { ExposeApi } from 'core/decorator/property.decorator';
import { NumericIdResponse, Pagination } from 'core/types/response.type';

import { SettingDataType } from '../../../common/enums/setting.enum';

export class MasterDataDetailResDto extends NumericIdResponse {
  @ExposeApi()
  value: string;

  @ExposeApi()
  name: string;

  @ExposeApi()
  public dataType: SettingDataType;
}

export class MasterDataListItemDto extends NumericIdResponse {
  @ExposeApi()
  public value: string;

  @ExposeApi()
  public name: string;

  @ExposeApi()
  public dataType: SettingDataType;
}

export class MasterDataCreateResDto extends NumericIdResponse {}

export class MasterDataUpdateResDto extends MasterDataDetailResDto {}

export class MasterDataDeleteResDto extends NumericIdResponse {}

export class MasterDataListResDto extends Pagination<MasterDataListItemDto> {
  @ExposeApi({ apiOption: { type: [MasterDataListItemDto] } })
  @Type(() => MasterDataListItemDto)
  items: MasterDataListItemDto[];
}
