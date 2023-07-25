import { applyDecorators } from '@nestjs/common';
import { isDefined } from 'class-validator';

import { CheckMaxLength } from './common/checkLength.decorator';
import { CheckRequired } from './common/checkRequired.decorator';

export function CheckAny(options: { required?: boolean; max?: number }) {
  const decorators: PropertyDecorator[] = [];
  decorators.push(CheckRequired(options.required));

  if (isDefined(options.max) && options.max > 0) {
    decorators.push(CheckMaxLength(options.max));
  }

  return applyDecorators(...decorators);
}
