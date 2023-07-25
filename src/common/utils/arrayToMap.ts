import { isDefined } from 'class-validator';

export function arrayToMap<T>(arr: T[], key: (value: T, index: number) => any) {
  if (isDefined(arr) && arr.length > 0) {
    return arr.reduce((map, v, i) => {
      map[key(v, i)] = v;

      return map;
    }, {});
  }

  return {};
}
