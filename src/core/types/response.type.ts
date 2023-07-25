import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { MessageCode } from 'common/constants/messageCode';
import { ExposeApi } from 'core/decorator/property.decorator';
import { assignDataToInstance } from 'core/helper';

export class HttpResponse<T> {
  @ApiPropertyOptional()
  statusCode?: number;

  @ApiPropertyOptional()
  messageCode?: MessageCode;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional({ type: Object })
  data?: T;

  @ApiPropertyOptional()
  error?: any;

  @ApiProperty()
  success?: boolean;

  constructor(data?: Partial<HttpResponse<T>>) {
    assignDataToInstance(data, this);
  }
}

export class PaginationMetaData {
  @ExposeApi()
  page: number;

  @ExposeApi()
  perPage: number;

  @ExposeApi()
  total: number;
}

export class Pagination<T> {
  items: T[];

  @Expose()
  pagination?: PaginationMetaData;
}

export abstract class RootResponse {}

export abstract class NumericIdResponse extends RootResponse {
  @ExposeApi()
  id: number;
}

export abstract class StringIdResponse {
  @ExposeApi()
  id: string;
}

export abstract class ModifiedInfoResponse extends NumericIdResponse {
  @ExposeApi({ apiOption: { type: Date } })
  @Transform(({ obj }) => obj.modifiedInfo?.createdAt)
  createdAt?: Date;

  @ExposeApi({ apiOption: { type: Date } })
  @Transform(({ obj }) => obj.modifiedInfo?.updatedAt)
  updatedAt?: Date;
}
