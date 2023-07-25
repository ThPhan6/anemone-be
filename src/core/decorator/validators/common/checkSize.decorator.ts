import { ValidateBy } from 'class-validator';
import { sjisSize } from 'common/utils/string';

export function CheckMaxSize(max: number) {
  return ValidateBy({
    name: 'checkMaxSize',
    validator: {
      validate(value: string) {
        return sjisSize(value) <= max;
      },
    },
  });
}

export function CheckSizeNotEnough(min: number) {
  return ValidateBy({
    name: 'checkMaxSize',
    validator: {
      validate(value: string) {
        return sjisSize(value) >= min;
      },
    },
  });
}
