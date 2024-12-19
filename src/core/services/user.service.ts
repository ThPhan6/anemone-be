import { Injectable } from '@nestjs/common';
import { User } from 'common/entities/user.entity';
import { UserRepository } from 'common/repositories/user.repository';
import { UserGetListQueries } from 'modules/cms/v1/user-management/dto/user.request';
import { FindOptionsWhere } from 'typeorm';

import { BaseService } from './base.service';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(repo: UserRepository) {
    super(repo);
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

  async getUserDetailByEmail(email: string) {
    return this.findOne({
      where: {
        email,
      },
      relations: ['profile'],
    });
  }

  async getUserDetailBy(where: FindOptionsWhere<User>) {
    return this.findOne({
      where,
      relations: ['profile'],
    });
  }
}
