import { Type } from 'class-transformer';
import { ExposeApi } from 'core/decorator/property.decorator';
import { Pagination, StringIdResponse } from 'core/types/response.type';

export class ScentDetailResDto extends StringIdResponse {
  @ExposeApi()
  name: string;
}

export class ScentListItemDto extends StringIdResponse {
  @ExposeApi()
  public name: string;
}

export class ScentCreateResDto extends ScentDetailResDto {}

export class ScentUpdateResDto extends ScentDetailResDto {}

export class ScentDeleteResDto extends StringIdResponse {}

export class ScentListResDto extends Pagination<ScentListItemDto> {
  @ExposeApi({ apiOption: { type: [ScentListItemDto] } })
  @Type(() => ScentListItemDto)
  items: ScentListItemDto[];
}
