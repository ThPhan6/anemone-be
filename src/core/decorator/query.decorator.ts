import { Transform } from 'class-transformer';

export function QueryParamToArray<T>(trans?: (value: string) => T) {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      const arr = value.split(',').filter(v => v !== '');
      if (trans) {
        return arr.map(v => trans(v));
      }

      return arr;
    }

    return value;
  });
}
