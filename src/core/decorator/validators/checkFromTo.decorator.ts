import { IsValidatedWithOtherProperty } from './common/isValidatedWithOtherProperty.decorator';

export function CheckFromNotGreaterThanTo(toProperty: string) {
  return IsValidatedWithOtherProperty(
    toProperty,
    (from, to) => {
      if (!from || !to) {
        return true;
      }

      return from <= to;
    },
    'checkFromLessThanTo',
  );
}
