import * as archiver from 'archiver';
import { FindManyOptions, FindOptionsOrder, Repository } from 'typeorm';

import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { convertURLToS3Readable } from './file';

export const getSubStringBetween2Characters = (str: string, startChar: string, endChar: string) => {
  const startIndex = str.indexOf(startChar) + 1;
  const endIndex = str.indexOf(endChar);

  if (startIndex === -1 || endIndex === -1) {
    return {
      start: str,
      sub: '',
      end: '',
    };
  }

  return {
    start: str.substring(0, startIndex),
    sub: str.substring(startIndex, endIndex),
    end: str.substring(endIndex, str.length),
  };
};

export interface PaginationOptions<T> {
  where?: FindManyOptions<T>['where'];
  params: ApiBaseGetListQueries & { order?: FindOptionsOrder<T> };
  relations?: FindManyOptions<T>['relations'];
}

export async function paginate<T>(repo: Repository<T>, options: PaginationOptions<T>) {
  const { page = 1, perPage = 10, order } = options.params;

  const [items, total] = await repo.findAndCount({
    where: options.where,
    relations: options.relations,
    order: order ?? ({ createdAt: 'DESC' } as any),
    skip: (page - 1) * perPage,
    take: perPage,
  });

  return {
    items,
    pagination: {
      total,
      page,
      perPage,
    },
  };
}

/**
 * Recursively transforms image URLs and automatically detects and transforms
 * stringified arrays in a nested JSON structure,
 * while preserving Date objects and entity relationships.
 *
 * @param data Any JSON object or array that might contain image URLs or stringified arrays.
 * @param imageKeys Array of key names to look for when transforming URLs (default: ['image']).
 * @returns A new object with all specified image URLs and detected stringified arrays transformed.
 */
export const transformImageUrls = <T>(
  data: T,
  imageKeys: string[] = ['image'],
  keysToRemove: string[] = ['deletedAt'],
): T => {
  // Handle null or undefined values
  if (data === null || data === undefined) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => transformImageUrls(item, imageKeys)) as unknown as T;
  }

  // Handle objects (but avoid modifying Date objects)
  if (typeof data === 'object' && !(data instanceof Date)) {
    // Create a shallow copy to avoid modifying the original
    const result = { ...data } as any;
    // Remove specified keys
    keysToRemove.forEach((keyToRemove) => {
      delete result[keyToRemove];
    });

    // Process each key in the object
    for (const key in result) {
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        const value = result[key];

        // Transform image URLs if the key is in the imageKeys array
        if (imageKeys.includes(key) && typeof value === 'string' && value) {
          result[key] = convertURLToS3Readable(value);
        }
        // Automatically check and transform stringified arrays
        else if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
          try {
            result[key] = JSON.parse(value);
          } catch (error) {
            // console.error(`Error parsing potential array for key "${key}":`, error);
            // Keep the original string value if parsing fails
          }
        }
        // Recursively process nested objects if they're not Dates
        else if (value !== null && typeof value === 'object' && !(value instanceof Date && value)) {
          result[key] = transformImageUrls(value, imageKeys);
        }
      }
    }

    return result;
  }

  // Return primitive values and Date objects as is
  return data;
};

interface PasswordFormat {
  minLength?: number;
  requireLowercase?: boolean;
  requireUppercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialCharacters?: boolean;
}

export const generateRandomPassword = (
  length = 12,
  passwordFormat: PasswordFormat = {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialCharacters: true,
  },
) => {
  // Validate minimum length
  const actualLength = Math.max(length, passwordFormat.minLength || 8);

  const specialChars = '!@#$%^&*()_+=-`~[]\{}|;\':",./<>?';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  let password = '';
  let availableChars = '';

  // Add required character types based on password format
  if (passwordFormat.requireSpecialCharacters) {
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
    availableChars += specialChars;
  }

  if (passwordFormat.requireLowercase) {
    password += lowercaseLetters[Math.floor(Math.random() * lowercaseLetters.length)];
    availableChars += lowercaseLetters;
  }

  if (passwordFormat.requireUppercase) {
    password += uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];
    availableChars += uppercaseLetters;
  }

  if (passwordFormat.requireNumbers) {
    password += numbers[Math.floor(Math.random() * numbers.length)];
    availableChars += numbers;
  }

  // If no specific requirements, use all character types
  if (availableChars === '') {
    availableChars = specialChars + lowercaseLetters + uppercaseLetters + numbers;
  }

  // Fill the rest of the password with random characters from available sets
  for (let i = password.length; i < actualLength; i++) {
    password += availableChars[Math.floor(Math.random() * availableChars.length)];
  }

  // Shuffle the password to make it more random
  password = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  return password;
};

export function formatDeviceName(serialNumber: string): string {
  return `Anemone_${serialNumber}`;
}

export function formatThingName(name: string): string {
  return `ANEMONE-${name}`;
}

/**
 * Create a zip buffer in memory from an array of files
 * @param files Array of objects containing file data and name
 * @returns Promise<Buffer> The zip file as a buffer
 */
export function createZipBuffer(
  files: Array<{ name: string; data: Buffer | string }>,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', (err) => reject(err));

      files.forEach((file) => {
        archive.append(file.data, { name: file.name });
      });

      archive.finalize();
    } catch (err) {
      reject(err);
    }
  });
}

export async function downloadToBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file from ${url}`);
  }

  return Buffer.from(await response.arrayBuffer());
}
