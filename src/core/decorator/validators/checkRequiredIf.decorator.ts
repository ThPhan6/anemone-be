import { applyDecorators } from '@nestjs/common';
import { ValidateIf } from 'class-validator';

import { CheckRequired } from './common/checkRequired.decorator';

export function CheckRequiredIf(condition: (object: any, value: any) => boolean) {
  const decorators: PropertyDecorator[] = [];
  decorators.push(ValidateIf(condition));
  decorators.push(CheckRequired(true));

  return applyDecorators(...decorators);
}
