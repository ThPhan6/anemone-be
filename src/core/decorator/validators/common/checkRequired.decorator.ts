import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { ExposeApi, ExposeApiOptional } from 'core/decorator/property.decorator';

import { AllowUndefined } from './allowUndefined.decorator';

export function CheckRequired(required?: boolean) {
  if (required === true) {
    return applyDecorators(ExposeApi(), IsNotEmpty());
  }

  return applyDecorators(ExposeApiOptional(), AllowUndefined());
}
