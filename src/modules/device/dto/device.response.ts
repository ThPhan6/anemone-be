import { Type } from 'class-transformer';
import { ExposeApi } from 'core/decorator/property.decorator';
import { NumericIdResponse, Pagination } from 'core/types/response.type';

export class DeviceDetailResDto extends NumericIdResponse {
  @ExposeApi()
  name: string;
}

export class DeviceListItemDto extends NumericIdResponse {
  @ExposeApi()
  public name: string;
}

export class DeviceCreateResDto extends DeviceDetailResDto {}

export class DeviceUpdateResDto extends DeviceDetailResDto {}

export class DeviceDeleteResDto extends NumericIdResponse {}

export class DeviceListResDto extends Pagination<DeviceListItemDto> {
  @ExposeApi({ apiOption: { type: [DeviceListItemDto] } })
  @Type(() => DeviceListItemDto)
  items: DeviceListItemDto[];
}
