import { applyDecorators } from '@nestjs/common';
import { ValidateBy } from 'class-validator';
import { isHan } from 'common/utils/string';

import { CheckRequired } from './common/checkRequired.decorator';

function IsDateSlashed(separator?: string) {
  return ValidateBy({
    name: 'isDateSlashed',
    validator: {
      validate(value: string) {
        if (!isHan(value)) {
          return false;
        }

        const arr = value.split(separator ?? '-');

        return arr.length === 3 && !isNaN(Date.parse(value));
      },
    },
  });
}

export function CheckDate(options: { required?: boolean; separator?: string }) {
  const decorators: PropertyDecorator[] = [];
  decorators.push(CheckRequired(options.required));
  decorators.push(IsDateSlashed(options.separator));

  return applyDecorators(...decorators);
}
