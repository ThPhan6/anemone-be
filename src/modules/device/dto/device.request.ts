import { ExposeApiOptional } from 'core/decorator/property.decorator';
import { CheckAny } from 'core/decorator/validators/checkAny.decorator';
import { ApiBaseGetListQueries } from 'core/types/apiQuery.type';

export class CreateDeviceDto {
  @CheckAny({ required: true })
  name: string;
}

export class UpdateDeviceDto {
  @CheckAny({ required: true })
  name: string;
}

export class DeviceGetListQueries extends ApiBaseGetListQueries {
  @ExposeApiOptional()
  name: string;
}
