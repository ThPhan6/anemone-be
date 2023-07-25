import { ExposeApiOptional } from 'core/decorator/property.decorator';

export class ApiBaseGetListQueries {
  @ExposeApiOptional()
  page?: number;

  @ExposeApiOptional()
  perPage?: number;

  @ExposeApiOptional({
    apiOption: { description: 'Includes soft-deleted items in result if deleted=true' },
  })
  deleted?: boolean;
}

export class ApiGetListQueries extends ApiBaseGetListQueries {
  @ExposeApiOptional()
  search?: string;
}

export class ApiDeleteQueries {
  @ExposeApiOptional({
    apiOption: { description: 'Use soft-delete if soft=true' },
  })
  soft?: boolean;
}
