import { Injectable } from '@nestjs/common';
import { BaseRepository, SoftDeleteCriteria } from 'common/repositories/base.repository';
import { ApiGetListQueries } from 'core/types/apiQuery.type';
import { Pagination } from 'core/types/response.type';
import {
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
  ): Promise<Pagination<T>> {
    const page = query.page || 1;
    const perPage = query.perPage || 10;
    const [data, total] = await this.repository.findAndCount({
      skip: (page - 1) * perPage,
      take: perPage,
      relations,
    });

    return {
      items: data,
      pagination: { total, page, perPage },
    };
  }
}
