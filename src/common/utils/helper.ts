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

export function formatDeviceName(serialNumber: string): string {
  return `Anemone_${serialNumber}`;
}
