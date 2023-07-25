import { HttpStatus, UseInterceptors } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { ApiInternalErrorException } from 'common/types/apiException.type';
import { HttpResponse } from 'core/types/response.type';

import { TransformInterceptor } from '../interceptor/transform.interceptor';

@UseInterceptors(TransformInterceptor)
export class BaseController {
  public dataType(type: ClassConstructor<any>, data?: any) {
    if (!data) {
      throw new ApiInternalErrorException();
    }

    return plainToInstance(type, data, {
      strategy: 'excludeAll',
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
      enableImplicitConversion: true,
    });
  }

  public ok(success: boolean, options?: Partial<HttpResponse<unknown>>) {
    return new HttpResponse({ ...options, success, statusCode: HttpStatus.OK });
  }
}
