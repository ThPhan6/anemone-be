import { Type } from 'class-transformer';
import { ExposeApi } from 'core/decorator/property.decorator';
import { NumericIdResponse, Pagination } from 'core/types/response.type';

export class ScentDetailResDto extends NumericIdResponse {
  @ExposeApi()
  name: string;
}

export class ScentListItemDto extends NumericIdResponse {
  @ExposeApi()
  public name: string;
}

export class ScentCreateResDto extends ScentDetailResDto {}

export class ScentUpdateResDto extends ScentDetailResDto {}

export class ScentDeleteResDto extends NumericIdResponse {}

export class ScentListResDto extends Pagination<ScentListItemDto> {
  @ExposeApi({ apiOption: { type: [ScentListItemDto] } })
  @Type(() => ScentListItemDto)
  items: ScentListItemDto[];
}
