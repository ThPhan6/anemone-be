import { applyDecorators } from '@nestjs/common';
import { Matches } from 'class-validator';
import { RegularExpression } from 'common/constants/app.constants';

import { CheckRequired } from './common/checkRequired.decorator';
import { CheckMaxSize } from './common/checkSize.decorator';

export function CheckNumAlpha(options: { required?: boolean; max: number }) {
  const decorators: PropertyDecorator[] = [];
  decorators.push(CheckRequired(options.required));
  decorators.push(Matches(RegularExpression.hanNumAlpha));
  decorators.push(CheckMaxSize(options.max));

  return applyDecorators(...decorators);
}
