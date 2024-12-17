import { Pagination } from 'core/types/response.type';
import {
  DataSource,
  DeepPartial,
  DeleteResult,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectId,
  QueryRunner,
  ReplicationMode,
  Repository,
  SaveOptions,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { EntityTarget } from 'typeorm/common/EntityTarget';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

type DeleteCriteria<T> =
  | string
  | string[]
  | number
  | number[]
  | Date
  | Date[]
  | ObjectId
  | ObjectId[]
  | FindOptionsWhere<T>;

export type SoftDeleteCriteria =
  | string
  | string[]
  | number
  | number[]
  | Date
  | Date[]
  | ObjectId
  | ObjectId[]
  | any;

export class BaseRepository<T extends { id: string }> {
  constructor(
    private readonly target: EntityTarget<T>,
    private readonly dataSource: DataSource,
  ) {}

  private getRepository(): Repository<T> {
    return this.dataSource.getRepository(this.target);
  }

  manager(): EntityManager {
    return this.getRepository().manager;
  }

  find(options?: FindManyOptions<T>): Promise<T[]> {
    return this.getRepository().find(options);
  }

  findBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T[]> {
    return this.getRepository().findBy(where);
  }

  findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]> {
    return this.getRepository().findAndCount(options);
  }

  findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.getRepository().findOne(options);
  }

  findOneBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T | null> {
    return this.getRepository().findOneBy(where);
  }

  exist(options?: FindManyOptions<T>): Promise<boolean> {
    return this.getRepository().exist(options);
  }

  count(options?: FindManyOptions<T>): Promise<number> {
    return this.getRepository().count(options);
  }

  countBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<number> {
    return this.getRepository().countBy(where);
  }

  save(entity: DeepPartial<T>, options?: SaveOptions): Promise<DeepPartial<T> & T> {
    return this.getRepository().save(entity, options);
  }

  bulkSave(entities: DeepPartial<T>[], options?: SaveOptions): Promise<(DeepPartial<T> & T)[]> {
    return this.getRepository().save(entities, options);
  }

  update(
    criteria: string | number | FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return this.getRepository().update(criteria, partialEntity);
  }

  updateMany(
    criteria: FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return this.getRepository().update(criteria, partialEntity);
  }

  delete(criteria: DeleteCriteria<T>): Promise<DeleteResult> {
    return this.getRepository().delete(criteria);
  }

  softDelete(criteria: SoftDeleteCriteria): Promise<UpdateResult> {
    return this.getRepository().softDelete(criteria);
  }

  softDeleteMany(criteria: SoftDeleteCriteria): Promise<UpdateResult> {
    return this.getRepository().softDelete(criteria);
  }

  restore(criteria: SoftDeleteCriteria): Promise<UpdateResult> {
    return this.getRepository().restore(criteria);
  }

  async getList(page = 1, perPage = 10, options?: FindOneOptions<T>): Promise<Pagination<T>> {
    const correctPage = page < 1 ? 1 : page;
    let itemsPerPage = perPage;
    let items: T[] = [];
    let total = 0;
    if (perPage > 0) {
      const offset = (correctPage - 1) * perPage;
      const correctOptions: FindManyOptions = options ?? {};
      correctOptions.skip = offset;
      correctOptions.take = perPage;
      const result = await this.findAndCount(correctOptions);
      items = result[0];
      total = result[1];
    } else {
      if (correctPage == 1) {
        items = await this.find(options);
        total = items.length;
      } else {
        total = await this.count(options);
      }

      itemsPerPage = total;
    }

    return {
      items: items,
      pagination: {
        page: correctPage,
        perPage: itemsPerPage,
        total: total,
      },
    };
  }

  createQueryBuilder(alias?: string, queryRunner?: QueryRunner): SelectQueryBuilder<T> {
    return this.getRepository().createQueryBuilder(alias, queryRunner);
  }

  createQueryRunner(mode?: ReplicationMode): QueryRunner {
    return this.dataSource.createQueryRunner(mode);
  }

  query(query: string, parameters?: any[]) {
    return this.getRepository().query(query, parameters);
  }
}
