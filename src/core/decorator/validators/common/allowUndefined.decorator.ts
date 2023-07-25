import { ValidateIf, ValidationOptions } from 'class-validator';

export function AllowUndefined(options?: ValidationOptions) {
  return ValidateIf((obj, value) => {
    return value !== undefined;
  }, options);
}

export function AllowBlank(options?: ValidationOptions) {
  return ValidateIf((_, value) => {
    return value !== '';
  }, options);
}

export function AllowNull(options?: ValidationOptions) {
  return ValidateIf((_, value) => {
    return value !== null;
  }, options);
}
