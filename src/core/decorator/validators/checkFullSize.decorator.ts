import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, Matches } from 'class-validator';
import { RegularExpression } from 'common/constants/app.constants';

import { ExposeApi } from '../property.decorator';
import { CheckMaxLength } from './common/checkLength.decorator';
import { CheckRequired } from './common/checkRequired.decorator';

export function CheckFullSize(options: { required?: boolean; max: number }) {
  const decorators: PropertyDecorator[] = [];
  decorators.push(CheckRequired(options.required));
  decorators.push(Matches(RegularExpression.fullSize));
  decorators.push(CheckMaxLength(options.max));

  return applyDecorators(...decorators);
}

export function CheckFullSizeEachItem(options: { max: number }) {
  const decorators: PropertyDecorator[] = [];
  decorators.push(ExposeApi());
  decorators.push(IsNotEmpty({ each: true }));
  decorators.push(Matches(RegularExpression.fullSize, { each: true }));
  decorators.push(CheckMaxLength(options.max, { each: true }));

  return applyDecorators(...decorators);
}
