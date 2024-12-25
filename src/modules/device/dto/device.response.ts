import { Type } from 'class-transformer';
import { ExposeApi } from 'core/decorator/property.decorator';
import { Pagination, StringIdResponse } from 'core/types/response.type';

export class DeviceDetailResDto extends StringIdResponse {
  @ExposeApi()
  name: string;
}

export class DeviceListItemDto extends StringIdResponse {
  @ExposeApi()
  public name: string;
}

export class DeviceCreateResDto extends DeviceDetailResDto {}

export class DeviceUpdateResDto extends DeviceDetailResDto {}

export class DeviceDeleteResDto extends StringIdResponse {}

export class DeviceListResDto extends Pagination<DeviceListItemDto> {
  @ExposeApi({ apiOption: { type: [DeviceListItemDto] } })
  @Type(() => DeviceListItemDto)
  items: DeviceListItemDto[];
}
