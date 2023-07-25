import { applyDecorators } from '@nestjs/common';

import { CheckRequired } from './common/checkRequired.decorator';

export function CheckInsuranceCode(options: { required?: boolean }) {
  const decorators: PropertyDecorator[] = [];
  decorators.push(CheckRequired(options.required));

  return applyDecorators(...decorators);
}
