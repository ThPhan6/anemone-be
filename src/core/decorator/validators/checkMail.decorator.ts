import { applyDecorators } from '@nestjs/common';
import { isDefined, Matches } from 'class-validator';
import { RegularExpression } from 'common/constants/app.constants';

import { CheckRequired } from './common/checkRequired.decorator';
import { CheckMaxSize } from './common/checkSize.decorator';

export function CheckMail(options: { required?: boolean; max?: number }) {
  const decorators: PropertyDecorator[] = [];
  decorators.push(CheckRequired(options.required));
  decorators.push(Matches(RegularExpression.mail));
  if (isDefined(options.max) && options.max > 0) {
    decorators.push(CheckMaxSize(options.max));
  }

  return applyDecorators(...decorators);
}
