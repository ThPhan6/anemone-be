import { FindManyOptions, FindOptionsOrder, Repository } from 'typeorm';

import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { ScentConfig } from '../../modules/scent-config/entities/scent-config.entity';
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

export const transformScentConfig = (scentConfig: ScentConfig) => {
  if (!scentConfig) {
    return null;
  }

  return {
    ...scentConfig,
    background: convertURLToS3Readable(scentConfig.background),
    notes: scentConfig.notes.map((note) => ({
      ...note,
      image: convertURLToS3Readable(note.image),
    })),
    story: {
      ...scentConfig.story,
      image: convertURLToS3Readable(scentConfig.story.image),
    },
  };
};

/**
 * Recursively transforms all image URLs in a nested JSON structure
 * while preserving Date objects and entity relationships
 * @param data Any JSON object or array that might contain image URLs
 * @returns A new object with all image URLs transformed
 */
export const transformImageUrls = <T>(data: T): T => {
  // Handle null or undefined values
  if (data === null || data === undefined) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => transformImageUrls(item)) as unknown as T;
  }

  // Handle objects (but avoid modifying Date objects)
  if (typeof data === 'object' && !(data instanceof Date)) {
    // Create a shallow copy to avoid modifying the original
    const result = { ...data } as any;

    // Process each key in the object
    for (const key in result) {
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        const value = result[key];

        // Transform image URLs
        if (key === 'image' && typeof value === 'string') {
          result[key] = convertURLToS3Readable(value);
        }
        // Recursively process nested objects if they're not Dates
        else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
          result[key] = transformImageUrls(value);
        }
      }
    }

    return result;
  }

  // Return primitive values and Date objects as is
  return data;
};
