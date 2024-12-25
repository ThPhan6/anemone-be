import { ExposeApiOptional } from 'core/decorator/property.decorator';
import { CheckAny } from 'core/decorator/validators/checkAny.decorator';
import { ApiBaseGetListQueries } from 'core/types/apiQuery.type';

export class CreateScentDto {
  @CheckAny({ required: true })
  name: string;
}

export class UpdateScentDto {
  @CheckAny({ required: true })
  name: string;
}

export class ScentGetListQueries extends ApiBaseGetListQueries {
  @ExposeApiOptional()
  name: string;
}
