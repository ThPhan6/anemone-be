import { MaxLength, ValidationOptions } from 'class-validator';

export function CheckMaxLength(max: number, validationOptions?: ValidationOptions) {
  return MaxLength(max, validationOptions);
}
