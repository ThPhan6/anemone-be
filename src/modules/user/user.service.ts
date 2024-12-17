import { Injectable } from '@nestjs/common';
import { User } from 'common/entities/user.entity';
import { UserRepository } from 'common/repositories/user.repository';
import { BaseService } from 'core/services/base.service';
import { UserGetListQueries } from 'modules/cms/v1/user/dto/user.request';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(repository: UserRepository) {
    super(repository);
  }

  async getListUser(queries: UserGetListQueries) {
    return this.findAll(queries, {
      profile: true,
    });
  }

  async getUserDetail(id: string) {
    return this.findOne({
      where: {
        id,
      },
      relations: ['profile'],
    });
  }

  // async create(item: UserCreateReqDto, currentUser: IDataSign): Promise<User> {
  //   const validatedData = await this.validInput(item);

  //   const createdItem: DeepPartial<User> = validatedData;
  //   createdItem.modifiedInfo = { createdBy: currentUser.userId };

  //   return this.repository.save(createdItem);
  // }

  // async getDetail(id: string): Promise<UserDetailResDto> {
  //   const user = await this.validUser(id);

  //   const result = user as UserDetailResDto;
  //   result.password = decryptForPassword(user.password);

  //   return result;
  // }

  // async update(id: string, item: UserUpdateReqDto, currentUser: IDataSign): Promise<User> {
  //   const user = await this.validUser(id);

  //   const validatedData = await this.validInput(item, id);

  //   assignDataToOther(validatedData, user);
  //   user.modifiedInfo.updatedBy = currentUser.userId;

  //   const runner = this.repository.createQueryRunner('master');
  //   await runner.connect();
  //   await runner.startTransaction();
  //   try {
  //     const updatedUser = await runner.manager.save(User, user);

  //     await runner.commitTransaction();

  //     return updatedUser;
  //   } catch (err) {
  //     await runner.rollbackTransaction();
  //     throw err;
  //   } finally {
  //     await runner.release();
  //   }
  // }

  // async delete(id: string): Promise<string> {
  //   const runner = this.repository.createQueryRunner('master');
  //   await runner.connect();
  //   await runner.startTransaction();
  //   try {
  //     await runner.manager.delete(User, id);

  //     await runner.commitTransaction();

  //     return id;
  //   } catch (err) {
  //     await runner.rollbackTransaction();
  //     throw err;
  //   } finally {
  //     await runner.release();
  //   }
  // }

  // async getList(queries: UserGetListQueries): Promise<Pagination<UserListItemDto>> {
  //   const defaultLimit = 100;
  //   const page = !queries.page || queries.page < 1 ? 1 : queries.page;
  //   const perPage = queries.perPage || defaultLimit;

  //   const newQueries = { ...queries, page, perPage };

  //   return this.performGetList(newQueries);
  // }

  // private async validInput(item: UserCreateReqDto, id?: string) {
  //   const errorDescription = new ApiErrorDescription();
  //   item.password = encryptedPassword(item.password);

  //   const validatedData: DeepPartial<User> = item;

  //   const user = await this.checkDuplicateUser(item.mailAddress, id);
  //   if (user) {
  //     errorDescription[user] = [ErrorCode.itemExisting];
  //   }

  //   ApiBadRequestException.checkErrorDescription(errorDescription);

  //   return validatedData;
  // }

  // private async checkDuplicateUser(mailAddress: string, id?: string) {
  //   const user = await this.repository.findOneBy({ mailAddress });
  //   if (!user || user.id === id) {
  //     return;
  //   }

  //   return 'mailAddress';
  // }

  // private async validUser(id: string): Promise<User> {
  //   const user = await this.repository.findOneBy({ id });
  //   if (!user) {
  //     throw new ApiNotFoundException(MessageCode.notFound);
  //   }

  //   return user;
  // }

  // private getListResult(
  //   items: UserListItemDto[],
  //   page: number,
  //   perPage: number,
  //   total: number,
  // ): Pagination<UserListItemDto> {
  //   return {
  //     items: items,
  //     pagination: {
  //       page: page,
  //       perPage: perPage,
  //       total: total,
  //     },
  //   };
  // }

  // private filterUserList(
  //   queries: UserGetListQueries,
  //   trans?: (qb: SelectQueryBuilder<User>) => SelectQueryBuilder<User>,
  // ): SelectQueryBuilder<User> {
  //   const queryBuilder: SelectQueryBuilder<User> = this.repository
  //     .createQueryBuilder()
  //     .subQuery()
  //     .from(qb => {
  //       let builder = qb.from(User, 'u');
  //       builder = this.filterUser(builder, queries, trans);

  //       if (queries.perPage > 0) {
  //         builder = builder.limit(queries.perPage).offset((queries.page - 1) * queries.perPage);
  //       }

  //       return builder
  //         .addOrderBy('management_flg', 'DESC')
  //         .addOrderBy('management_order')
  //         .addOrderBy('user_div')
  //         .addOrderBy('company_id')
  //         .addOrderBy('division_id')
  //         .addOrderBy('id');
  //     }, 'u');

  //   return queryBuilder;
  // }

  // private filterUser(
  //   qb: SelectQueryBuilder<User>,
  //   queries: UserGetListQueries,
  //   trans?: (qb: SelectQueryBuilder<User>) => SelectQueryBuilder<User>,
  // ): SelectQueryBuilder<User> {
  //   let builder = qb;
  //   if (queries.userName && queries.userName !== '') {
  //     builder = builder.andWhere(`u.user_name ILIKE '%${queries.userName}%'`);
  //   }

  //   if (queries.mailAddress && queries.mailAddress !== '') {
  //     builder = builder.andWhere(`u.mail_address LIKE '%${queries.mailAddress}%'`);
  //   }

  //   return trans ? trans(builder) : builder;
  // }

  // private async performGetList(
  //   queries: UserGetListQueries,
  //   trans?: (qb: SelectQueryBuilder<User>) => SelectQueryBuilder<User>,
  // ): Promise<Pagination<UserListItemDto>> {
  //   const total = await this.filterUser(this.repository.createQueryBuilder('u'), queries, trans).getCount();
  //   if (total === 0) {
  //     return this.getListResult([], queries.page, queries.perPage, total);
  //   }

  //   const queryBuilder = this.filterUserList(queries, trans)
  //     .select(`u.id, u.user_name AS "userName", u.mail_address AS "mailAddress"`)
  //     .addOrderBy('u.id');

  //   const items = await queryBuilder.getRawMany();

  //   return this.getListResult(items, queries.page, queries.perPage, total);
  // }
}
