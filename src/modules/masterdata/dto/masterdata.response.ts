import { Type } from 'class-transformer';
import { ExposeApi } from 'core/decorator/property.decorator';
import { Pagination, StringIdResponse } from 'core/types/response.type';

export class MasterDataDetailResDto extends StringIdResponse {
  @ExposeApi()
  value: string;

  @ExposeApi()
  name: string;
}

export class MasterDataListItemDto extends StringIdResponse {
  @ExposeApi()
  public value: string;

  @ExposeApi()
  public name: string;
}

export class MasterDataCreateResDto extends StringIdResponse {}

export class MasterDataUpdateResDto extends MasterDataDetailResDto {}

export class MasterDataDeleteResDto extends StringIdResponse {}

export class MasterDataListResDto extends Pagination<MasterDataListItemDto> {
  @ExposeApi({ apiOption: { type: [MasterDataListItemDto] } })
  @Type(() => MasterDataListItemDto)
  items: MasterDataListItemDto[];
}
