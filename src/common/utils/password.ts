import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { randomInt } from './random';

enum RandomSource {
  number = '0123456789',
  alphaLower = 'abcdefghijklmnopqrstuvwxyz',
  alphaUpper = 'ABCDEFGHIJKLMNOPQRSTUXWXYZ',
}

const randString = (length: number, sources: RandomSource[], prohibitionChars: string): string => {
  let result = '';
  let characters = sources.join('');
  for (const c of prohibitionChars) {
    characters = characters.replace(c, '');
  }
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(randomInt(0, charactersLength - 1));
    counter += 1;
  }

  return result;
};

export const hashedPassword = (password: string): Promise<string> => {
  const rounds = parseInt(process.env.PASSWORD_HASH_ROUNDS) || 1;

  return bcrypt.hash(hashString(password), rounds);
};

export const isPasswordMatched = (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(hashString(password), hashedPassword);
};

const hashString = (str: string): string => {
  const hash = crypto.createHmac('sha256', process.env.CRYPTO_SALT);
  hash.update(str);
  const stringHashed = hash.digest('hex');

  return stringHashed;
};

export const getNewAccessPassword = (): string => {
  return randString(8, [RandomSource.number, RandomSource.alphaUpper, RandomSource.alphaLower], '01IOlo');
};

export const encryptedPassword = (stringOrig: string, key = process.env.CRYPTO_KEY): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(stringOrig);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const ivHex = iv.toString('hex');

  return ivHex.substring(0, 16) + encrypted.toString('hex') + ivHex.substring(16);
};

export function decryptForPassword(text: string, key = process.env.CRYPTO_KEY): string {
  const iv = Buffer.from(text.substring(0, 16) + text.substring(text.length - 16), 'hex');
  const encryptedText = Buffer.from(text.substring(16, text.length - 16), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(key, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

export function encryptedValue(value: string): string {
  return encryptedPassword(value);
}

export function decryptForValue(value: string): string {
  return decryptForPassword(value);
}
