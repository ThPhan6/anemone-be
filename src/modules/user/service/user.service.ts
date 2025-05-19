import { Injectable } from '@nestjs/common';
import { UserRepository } from 'common/repositories/user.repository';
import { BaseService } from 'core/services/base.service';
import { UserGetListQueries } from 'modules/user/dto/user.request';
import { UserRole } from 'modules/user/user.type';
import { FindOptionsWhere } from 'typeorm';

import { User } from '../entities/user.entity';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(repo: UserRepository) {
    super(repo);
  }

  async isExistUser(email: string) {
    return this.exists({
      where: { email },
    });
  }

  async getListUser(queries: UserGetListQueries, isAdmin = true) {
    return this.findAll(
      {
        ...(isAdmin ? queries : { ...queries, role: UserRole.MEMBER }),
      },
      {
        profile: true,
      },
      ['profile.name', 'email'],
    );
  }

  async getUserDetail(id: string, isAdmin = true) {
    return this.findOne({
      where: {
        id,
        ...(isAdmin ? {} : { role: UserRole.MEMBER }),
      },
      relations: ['profile'],
    });
  }

  async getUserDetailByEmail(email: string, isAdmin = true) {
    return this.findOne({
      where: {
        email,
        ...(isAdmin ? {} : { role: UserRole.MEMBER }),
      },
      relations: ['profile'],
    });
  }

  async getUserDetailBy(where: FindOptionsWhere<User>, isAdmin = true) {
    return this.findOne({
      ...(isAdmin ? { where } : { where: { ...where, role: UserRole.MEMBER } }),
      relations: ['profile'],
    });
  }
}
