import { Injectable } from '@nestjs/common';
import { ErrorCode } from 'common/constants/app.constants';
import { MessageCode } from 'common/constants/messageCode';
import { UserEntity } from 'common/entities/user.entity';
import { UserRepository } from 'common/repositories/user.repository';
import { ApiBadRequestException, ApiErrorDescription, ApiNotFoundException } from 'common/types/apiException.type';
import { IDataSign } from 'common/types/dataSign.type';
import { decryptForPassword, encryptedPassword } from 'common/utils/password';
import { assignDataToOther } from 'core/helper';
import { BaseService } from 'core/services/base.service';
import { Pagination } from 'core/types/response.type';
import { MailService } from 'modules/mail/mail.service';
import { DeepPartial, SelectQueryBuilder } from 'typeorm';

import { UserCreateReqDto, UserGetListQueries, UserUpdateReqDto } from './dto/user.request';
import { UserDetailResDto, UserListItemDto } from './dto/user.response';

@Injectable()
export class UserService extends BaseService {
  constructor(
    private readonly repository: UserRepository,
    private readonly mailService: MailService,
  ) {
    super();
  }

  async create(item: UserCreateReqDto, currentUser: IDataSign): Promise<UserEntity> {
    const validatedData = await this.validInput(item);

    const createdItem: DeepPartial<UserEntity> = validatedData;
    createdItem.modifiedInfo = { createdBy: currentUser.userId };

    return this.repository.save(createdItem);
  }

  async getDetail(id: string): Promise<UserDetailResDto> {
    const user = await this.validUser(id);

    const result = user as UserDetailResDto;
    result.password = decryptForPassword(user.password);

    return result;
  }

  async update(id: string, item: UserUpdateReqDto, currentUser: IDataSign): Promise<UserEntity> {
    const user = await this.validUser(id);

    const validatedData = await this.validInput(item, id);

    assignDataToOther(validatedData, user);
    user.modifiedInfo.updatedBy = currentUser.userId;

    const runner = this.repository.createQueryRunner('master');
    await runner.connect();
    await runner.startTransaction();
    try {
      const updatedUser = await runner.manager.save(UserEntity, user);

      await runner.commitTransaction();

      return updatedUser;
    } catch (err) {
      await runner.rollbackTransaction();
      throw err;
    } finally {
      await runner.release();
    }
  }

  async delete(id: string): Promise<string> {
    const runner = this.repository.createQueryRunner('master');
    await runner.connect();
    await runner.startTransaction();
    try {
      await runner.manager.delete(UserEntity, id);

      await runner.commitTransaction();

      return id;
    } catch (err) {
      await runner.rollbackTransaction();
      throw err;
    } finally {
      await runner.release();
    }
  }

  async getList(queries: UserGetListQueries): Promise<Pagination<UserListItemDto>> {
    const defaultLimit = 100;
    const page = !queries.page || queries.page < 1 ? 1 : queries.page;
    const perPage = queries.perPage || defaultLimit;

    const newQueries = { ...queries, page, perPage };

    return this.performGetList(newQueries);
  }

  private async validInput(item: UserCreateReqDto, id?: string) {
    const errorDescription = new ApiErrorDescription();
    item.password = encryptedPassword(item.password);

    const validatedData: DeepPartial<UserEntity> = item;

    const user = await this.checkDuplicateUser(item.mailAddress, id);
    if (user) {
      errorDescription[user] = [ErrorCode.itemExisting];
    }

    ApiBadRequestException.checkErrorDescription(errorDescription);

    return validatedData;
  }

  private async checkDuplicateUser(mailAddress: string, id?: string) {
    const user = await this.repository.findOneBy({ mailAddress });
    if (!user || user.id === id) {
      return;
    }

    return 'mailAddress';
  }

  private async validUser(id: string): Promise<UserEntity> {
    const user = await this.repository.findOneBy({ id });
    if (!user) {
      throw new ApiNotFoundException(MessageCode.notFound);
    }

    return user;
  }

  private getListResult(
    items: UserListItemDto[],
    page: number,
    perPage: number,
    total: number,
  ): Pagination<UserListItemDto> {
    return {
      items: items,
      pagination: {
        page: page,
        perPage: perPage,
        total: total,
      },
    };
  }

  private filterUserList(
    queries: UserGetListQueries,
    trans?: (qb: SelectQueryBuilder<UserEntity>) => SelectQueryBuilder<UserEntity>,
  ): SelectQueryBuilder<UserEntity> {
    const queryBuilder: SelectQueryBuilder<UserEntity> = this.repository
      .createQueryBuilder()
      .subQuery()
      .from(qb => {
        let builder = qb.from(UserEntity, 'u');
        builder = this.filterUser(builder, queries, trans);

        if (queries.perPage > 0) {
          builder = builder.limit(queries.perPage).offset((queries.page - 1) * queries.perPage);
        }

        return builder
          .addOrderBy('management_flg', 'DESC')
          .addOrderBy('management_order')
          .addOrderBy('user_div')
          .addOrderBy('company_id')
          .addOrderBy('division_id')
          .addOrderBy('id');
      }, 'u');

    return queryBuilder;
  }

  private filterUser(
    qb: SelectQueryBuilder<UserEntity>,
    queries: UserGetListQueries,
    trans?: (qb: SelectQueryBuilder<UserEntity>) => SelectQueryBuilder<UserEntity>,
  ): SelectQueryBuilder<UserEntity> {
    let builder = qb;
    if (queries.userName && queries.userName !== '') {
      builder = builder.andWhere(`u.user_name ILIKE '%${queries.userName}%'`);
    }

    if (queries.mailAddress && queries.mailAddress !== '') {
      builder = builder.andWhere(`u.mail_address LIKE '%${queries.mailAddress}%'`);
    }

    return trans ? trans(builder) : builder;
  }

  private async performGetList(
    queries: UserGetListQueries,
    trans?: (qb: SelectQueryBuilder<UserEntity>) => SelectQueryBuilder<UserEntity>,
  ): Promise<Pagination<UserListItemDto>> {
    const total = await this.filterUser(this.repository.createQueryBuilder('u'), queries, trans).getCount();
    if (total === 0) {
      return this.getListResult([], queries.page, queries.perPage, total);
    }

    const queryBuilder = this.filterUserList(queries, trans)
      .select(`u.id, u.user_name AS "userName", u.mail_address AS "mailAddress"`)
      .addOrderBy('u.id');

    const items = await queryBuilder.getRawMany();

    return this.getListResult(items, queries.page, queries.perPage, total);
  }
}
