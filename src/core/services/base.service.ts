import { Injectable } from '@nestjs/common';
import { BaseRepository, SoftDeleteCriteria } from 'common/repositories/base.repository';
import { ApiGetListQueries } from 'core/types/apiQuery.type';
import { Pagination } from 'core/types/response.type';
import {
  Brackets,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  SaveOptions,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class BaseService<T extends { id: string | number }> {
  constructor(public repository: BaseRepository<T>) {}

  async exists(options?: FindManyOptions<T>) {
    return this.repository.exist(options);
  }

  async create(entities: DeepPartial<T> | DeepPartial<T>[], options?: SaveOptions) {
    if (Array.isArray(entities)) {
      return this.repository.bulkSave(entities, options);
    }

    return this.repository.save(entities, options);
  }

  async saveAll(entities: DeepPartial<T>[], options?: SaveOptions) {
    return this.repository.bulkSave(entities, options);
  }

  async update(
    criteria: string | number | FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ) {
    return this.repository.update(criteria, partialEntity);
  }

  async updateMany(criteria: FindOptionsWhere<T>, partialEntity: QueryDeepPartialEntity<T>) {
    return this.repository.updateMany(criteria, partialEntity);
  }

  async delete(id: string | number) {
    return this.repository.softDelete(id);
  }

  async deleteMany(criteria: SoftDeleteCriteria) {
    return this.repository.softDeleteMany(criteria);
  }

  async findOne(options: FindOneOptions<T>) {
    return this.repository.findOne(options);
  }

  async findById(id: string | number) {
    return this.repository.findOneBy({ id } as FindOptionsWhere<T>);
  }

  async find(options?: FindManyOptions<T>) {
    return this.repository.find(options);
  }

  async findWithSelect(options?: FindManyOptions<T>, select?: (keyof T)[]) {
    const newOptions = options ? { ...options } : {};
    if (select && select.length > 0) {
      newOptions.select = select;
    }

    return this.repository.find(newOptions);
  }

  // Helper methods for query parameter processing
  private isNumericString(value: string): boolean {
    return !isNaN(Number(value)) && !isNaN(parseFloat(value));
  }

  private convertToAppropriateType(value: any): any {
    // Handle string values
    if (typeof value === 'string') {
      // Boolean conversion
      if (value.toLowerCase() === 'true') {
        return true;
      }

      if (value.toLowerCase() === 'false') {
        return false;
      }

      // Number conversion
      if (this.isNumericString(value)) {
        return Number(value);
      }

      // Keep other strings as-is
      return value;
    }

    // Handle arrays - convert numeric strings within arrays to numbers
    if (Array.isArray(value)) {
      return value.map((item) =>
        typeof item === 'string' && this.isNumericString(item) ? Number(item) : item,
      );
    }

    // Return other types unchanged
    return value;
  }

  /**
   * Process a query parameter that might be an array in string format
   * @param value The string value that might be JSON array
   * @param key The parameter key
   * @returns Processed value if it's array-like, or null if not array-like
   */
  private processArrayLikeParameter(value: string): any | null {
    if (typeof value !== 'string' || !value.startsWith('[') || !value.endsWith(']')) {
      return null;
    }

    try {
      const parsedValue = JSON.parse(value);

      if (Array.isArray(parsedValue)) {
        return parsedValue.map((item) => this.convertToAppropriateType(item));
      }

      return parsedValue; // Parsed JSON that's not an array
    } catch (e) {
      return value; // If parsing fails, return original value
    }
  }

  /**
   * Checks if a key is a bracket notation for orders
   * @param key The parameter key to check
   * @returns True if the key is an orders bracket notation
   */
  private isOrdersBracketNotation(key: string): boolean {
    return key.includes('[') && key.includes(']') && key.startsWith('orders');
  }

  /**
   * Process query parameters for filtering
   * @param params Object containing query parameters
   * @returns Filtered and converted query parameters
   */
  private processQueryParameters(params: Record<string, any>): Record<string, any> {
    const filteredQuery = {};

    Object.entries(params).forEach(([key, value]) => {
      // Skip bracket notation keys that are part of orders
      if (this.isOrdersBracketNotation(key)) {
        return;
      }

      // Handle array-like query parameters
      if (typeof value === 'string') {
        const processedArray = this.processArrayLikeParameter(value);
        if (processedArray !== null) {
          filteredQuery[key] = processedArray;

          return;
        }
      }

      // Convert values to appropriate types
      filteredQuery[key] = this.convertToAppropriateType(value);
    });

    return filteredQuery;
  }

  async findAll(
    query: ApiGetListQueries,
    relations?: FindManyOptions['relations'],
    searchColumns?: string[],
  ): Promise<Pagination<T>> {
    const page = query.page || 1;
    const perPage = query.perPage || 10;

    // Try to get orders from the query object first
    let orders = query.orders || [];

    // If no orders in the expected format, try to parse from bracket notation
    if (orders.length === 0) {
      // Extract orders from bracketed format (orders[0][name], orders[0][isDesc], etc.)
      const orderEntries = Object.entries(query)
        .filter(([key]) => key.startsWith('orders[') && key.includes(']['))
        .map(([key, value]) => {
          // Parse order index and property from key
          const matches = key.match(/orders\[(\d+)\]\[(\w+)\]/);
          if (matches) {
            const [, index, prop] = matches;

            return { index: parseInt(index), prop, value };
          }

          return null;
        })
        .filter((entry) => entry !== null);

      if (orderEntries.length > 0) {
        // Group by index to reconstruct order objects
        const orderMap = {};
        orderEntries.forEach((entry) => {
          if (!orderMap[entry.index]) {
            orderMap[entry.index] = {};
          }

          orderMap[entry.index][entry.prop] = entry.value;
        });

        // Convert to array and ensure boolean parsing for isDesc
        orders = Object.values(orderMap).map((order: any) => ({
          name: order.name || 'createdAt',
          isDesc: order.isDesc === 'true' || order.isDesc === true,
        }));
      }
    }

    // Default order if no valid orders found
    if (orders.length === 0) {
      orders = [{ name: 'createdAt', isDesc: true }];
    }

    // Create a clean copy of query without pagination and search parameters
    const restQuery = { ...query };
    delete restQuery.page;
    delete restQuery.perPage;
    delete restQuery.search;
    delete restQuery.orders;

    // Process additional query parameters
    const filteredQuery = this.processQueryParameters(restQuery);

    // Start building the query
    const qb = this.repository.createQueryBuilder('entity');

    // Add relations if they exist
    if (relations) {
      Object.keys(relations).forEach((relation) => {
        qb.leftJoinAndSelect(`entity.${relation}`, relation);
      });
    }

    // Add sorting
    orders.forEach((order, index) => {
      if (!order || !order.name) {
        return;
      }

      const [table, column] = order.name.split('.');
      const alias = column ? table : 'entity';
      const orderColumn = `${alias}.${column || order.name}`;

      if (index === 0) {
        qb.orderBy(orderColumn, order.isDesc ? 'DESC' : 'ASC');
      } else {
        qb.addOrderBy(orderColumn, order.isDesc ? 'DESC' : 'ASC');
      }
    });

    // Add where conditions for filtered query parameters
    if (Object.keys(filteredQuery).length) {
      Object.entries(filteredQuery).forEach(([key, value]) => {
        if (value === undefined) {
          return;
        }

        if (Array.isArray(value)) {
          qb.andWhere(`entity.${key} IN (:...${key})`, { [key]: value });

          return;
        }

        // Handle different data types appropriately for PostgreSQL
        if (typeof value === 'string' && value.includes('%')) {
          // If the value already contains wildcard characters, use ILIKE for pattern matching
          qb.andWhere(`entity.${key} ILIKE :${key}`, { [key]: value });
        } else if (value === null) {
          // Handle null values with IS NULL
          qb.andWhere(`entity.${key} IS NULL`);
        } else {
          // Standard equality check for regular fields
          qb.andWhere(`entity.${key} = :${key}`, { [key]: value });
        }
      });
    }

    // Add search
    if (query.search && searchColumns) {
      qb.andWhere(
        new Brackets((qb) => {
          searchColumns.forEach((column, index) => {
            // Ensure column name is properly qualified with entity alias if not already qualified
            const qualifiedColumn = column.includes('.') ? column : `entity.${column}`;

            if (index === 0) {
              qb.where(`${qualifiedColumn} ILIKE :search`, {
                search: `%${query.search}%`,
              });
            } else {
              qb.orWhere(`${qualifiedColumn} ILIKE :search`, {
                search: `%${query.search}%`,
              });
            }
          });
        }),
      );
    }

    // Add pagination
    qb.skip((page - 1) * perPage).take(perPage);

    // Execute the query
    const [data, total] = await qb.getManyAndCount();

    return {
      items: data,
      pagination: { total, page, perPage },
    };
  }
}
