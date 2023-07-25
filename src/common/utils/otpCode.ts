import { randomInt } from './random';

export function getOtp(length: number) {
  const result = [];
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result.push(characters.charAt(randomInt(0, charactersLength - 1)));
  }

  return result.join('');
}
