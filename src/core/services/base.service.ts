import { Injectable } from '@nestjs/common';
import { BaseRepository, SoftDeleteCriteria } from 'common/repositories/base.repository';
import { ApiGetListQueries } from 'core/types/apiQuery.type';
import { Pagination } from 'core/types/response.type';
import { omit } from 'lodash';
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
export class BaseService<T extends { id: string }> {
  constructor(public repository: BaseRepository<T>) {}

  async exists(options?: FindManyOptions<T>) {
    return this.repository.exist(options);
  }

  async create(entities: DeepPartial<T>, options?: SaveOptions) {
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

  async delete(id: string) {
    return this.repository.softDelete(id);
  }

  async deleteMany(criteria: SoftDeleteCriteria) {
    return this.repository.softDeleteMany(criteria);
  }

  async findOne(options: FindOneOptions<T>) {
    return this.repository.findOne(options);
  }

  async findById(id: string) {
    return this.repository.findOneBy({ id } as FindOptionsWhere<T>);
  }

  async find(options?: FindManyOptions<T>) {
    return this.repository.find(options);
  }

  async findAll(
    query: ApiGetListQueries,
    relations?: FindManyOptions['relations'],
    searchColumns?: string[],
  ): Promise<Pagination<T>> {
    const page = query.page || 1;
    const perPage = query.perPage || 10;
    const orders = query.orders || [
      {
        name: 'createdAt',
        isDesc: true,
      },
    ];

    const restQuery = omit(query, ['page', 'perPage', 'orders', 'search']);

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
      const [table, column] = order.name.split('.');
      const alias = column ? table : 'entity';
      const orderColumn = `${alias}.${column || order.name}`;

      if (index === 0) {
        qb.orderBy(orderColumn, order.isDesc ? 'DESC' : 'ASC');
      } else {
        qb.addOrderBy(orderColumn, order.isDesc ? 'DESC' : 'ASC');
      }
    });

    // Add where
    if (Object.keys(restQuery).length) {
      Object.keys(restQuery).forEach((key) => {
        if (restQuery[key] === undefined) {
          return;
        }

        qb.andWhere(`entity.${key} = :${key}`, { [key]: restQuery[key] });
      });
    }

    // Add search
    if (query.search && searchColumns) {
      qb.andWhere(
        new Brackets((qb) => {
          searchColumns.forEach((column, index) => {
            if (index === 0) {
              qb.where(`${column} LIKE :search`, { search: `%${query.search}%` });
            } else {
              qb.orWhere(`${column} LIKE :search`, { search: `%${query.search}%` });
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
