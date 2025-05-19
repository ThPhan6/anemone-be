import { Type } from 'class-transformer';
import { ExposeApiOptional } from 'core/decorator/property.decorator';

export class OrderSortDto {
  @ExposeApiOptional()
  name: string;

  @ExposeApiOptional()
  isDesc: boolean;
}

export class ApiBaseGetListQueries {
  @ExposeApiOptional()
  page?: number;

  @ExposeApiOptional()
  perPage?: number;

  @ExposeApiOptional({
    apiOption: { description: 'Order by field', type: [OrderSortDto] },
  })
  @Type(() => OrderSortDto)
  orders?: OrderSortDto[];

  @ExposeApiOptional()
  search?: string;

  [key: string]: any;
}

export class ApiGetListQueries extends ApiBaseGetListQueries {}

export class ApiDeleteQueries {
  @ExposeApiOptional({
    apiOption: { description: 'Use soft-delete if soft=true' },
  })
  soft?: boolean;
}
