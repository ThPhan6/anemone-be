import { ExposeApiOptional } from 'core/decorator/property.decorator';
import { CheckAny } from 'core/decorator/validators/checkAny.decorator';
import { ApiBaseGetListQueries } from 'core/types/apiQuery.type';

import { DeviceType } from '../../../common/enums/device.enum';

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

export class ImportDeviceDto {
  @CheckAny({ required: true })
  name: string;

  @CheckAny({ required: true })
  type: DeviceType;
}
