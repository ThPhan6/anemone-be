import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { User } from '../../modules/user/entities/user.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource);
  }
}
