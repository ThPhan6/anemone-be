import { Injectable } from '@nestjs/common';
import { UserEntity } from 'common/entities/user.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from './base.repository';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(dataSource: DataSource) {
    super(UserEntity, dataSource);
  }
}
