import { applyDecorators } from '@nestjs/common';
import { Matches } from 'class-validator';
import { RegularExpression } from 'common/constants/app.constants';

import { CheckRequired } from './common/checkRequired.decorator';

export function CheckTel(options: { required?: boolean }) {
  const decorators: PropertyDecorator[] = [];
  decorators.push(CheckRequired(options.required));
  decorators.push(Matches(RegularExpression.tel));

  return applyDecorators(...decorators);
}
