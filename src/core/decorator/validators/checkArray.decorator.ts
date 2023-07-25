import { applyDecorators } from '@nestjs/common';
import { ArrayMaxSize, ArrayMinSize, IsArray, isDefined, ValidateNested } from 'class-validator';

import { CheckRequired } from './common/checkRequired.decorator';

export function CheckArray(options: { required?: boolean; min?: number; max?: number }) {
  const decorators: PropertyDecorator[] = [];
  decorators.push(IsArray());
  decorators.push(ValidateNested({ each: true }));

  decorators.push(CheckRequired(options.required));

  if (isDefined(options.min) && options.min > 0) {
    decorators.push(ArrayMinSize(options.min));
  }

  if (isDefined(options.max) && options.max > 0) {
    decorators.push(ArrayMaxSize(options.max));
  }

  return applyDecorators(...decorators);
}
