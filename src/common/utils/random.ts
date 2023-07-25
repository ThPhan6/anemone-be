import * as crypto from 'crypto';

export function randomInt(min: number, max: number) {
  return crypto.randomInt(min, max);
}
