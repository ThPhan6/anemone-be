import { applyDecorators } from '@nestjs/common';
import { Matches } from 'class-validator';
import { RegularExpression } from 'common/constants/app.constants';

import { CheckRequired } from './common/checkRequired.decorator';
import { CheckMaxSize, CheckSizeNotEnough } from './common/checkSize.decorator';

export function CheckPassword(options: { required?: boolean; min: number; max: number }) {
  const decorators: PropertyDecorator[] = [];
  decorators.push(CheckRequired(options.required));
  decorators.push(Matches(RegularExpression.hanNumAlphaMix));
  decorators.push(CheckSizeNotEnough(options.min));
  decorators.push(CheckMaxSize(options.max));

  return applyDecorators(...decorators);
}
