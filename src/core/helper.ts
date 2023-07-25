import { HttpStatus } from '@nestjs/common';

import { HttpResponse } from './types/response.type';

export const buildResponse = <T>(response: HttpResponse<T>): any => {
  if (response instanceof HttpResponse) {
    response.statusCode = response.statusCode || (response.success ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR);

    return response;
  }

  const res: HttpResponse<T> = { success: true };
  res.statusCode = HttpStatus.OK;
  res.data = response;

  return res;
};

export function assignDataToInstance<T>(data: T, instance: T) {
  const keys = Object.keys(data || {});
  keys.forEach(key => {
    instance[key] = data[key];
  });
}

export function assignDataToOther<T, U>(data: T, instance: U) {
  const keys = Object.keys(data || {});
  keys.forEach(key => {
    if (data[key] !== undefined) {
      instance[key] = data[key];
    }
  });
}

export function assignNonNullDataToOther<T, U>(data: T, instance: U) {
  const keys = Object.keys(data || {});
  keys.forEach(key => {
    if (data[key] !== undefined && data[key] != null) {
      instance[key] = data[key];
    }
  });
}
